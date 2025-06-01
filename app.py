from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import mean_squared_error
import os

app = Flask(__name__)
# Configure CORS to allow all origins and methods
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Global variables to store loaded data
data_loaded = False
rest_pay = None
rest_cuisine = None
rest_hours = None
rest_parking = None
rest_geo = None
cons_cuisine = None
cons_pay = None
cons_profile = None
rating = None
user_item_matrix = None
user_similarity_df = None
cf_scores = None
cbf_scores_df = None
hybrid_scores = None
encoder = None

def load_dataset(file_name):
    """Load dataset from CSV file"""
    try:
        df = pd.read_csv(os.path.join('data', file_name))
        print(f'{file_name} has {df.shape[0]} samples with {df.shape[1]} features each.')
        return df
    except Exception as e:
        print(f'{file_name} could not be loaded. Error: {e}')
        return None

def load_all_data():
    """Load all datasets and initialize recommendation system"""
    global data_loaded, rest_pay, rest_cuisine, rest_hours, rest_parking, rest_geo
    global cons_cuisine, cons_pay, cons_profile, rating
    global user_item_matrix, user_similarity_df, cf_scores, cbf_scores_df, hybrid_scores, encoder

    if data_loaded:
        return True

    print('Loading restaurant datasets')
    rest_pay = load_dataset('chefmozaccepts.csv')
    rest_cuisine = load_dataset('chefmozcuisine.csv')
    rest_hours = load_dataset('chefmozhours4.csv')
    rest_parking = load_dataset('chefmozparking.csv')
    rest_geo = load_dataset('geoplaces2.csv')

    print('\nLoading consumer datasets')
    cons_cuisine = load_dataset('usercuisine.csv')
    cons_pay = load_dataset('userpayment.csv')
    cons_profile = load_dataset('userprofile.csv')

    print('\nLoading User-Item-Rating dataset')
    rating = load_dataset('rating_final.csv')

    # Filter users as in notebook
    if rating is not None and cons_profile is not None:
        list_users = rating['userID'].unique()
        cons_profile = cons_profile[cons_profile['userID'].isin(list_users)]

    # Initialize Collaborative Filtering
    user_item_matrix = rating.pivot_table(
        index='userID',
        columns='placeID',
        values='rating',
        fill_value=0
    )
    user_similarity = cosine_similarity(user_item_matrix)
    user_similarity_df = pd.DataFrame(
        user_similarity,
        index=user_item_matrix.index,
        columns=user_item_matrix.index
    )

    # Predict CF scores
    sim_sums = user_similarity_df.abs().sum(axis=1).replace(0, 1)
    cf_scores = np.dot(user_similarity_df, user_item_matrix) / sim_sums.values[:, np.newaxis]
    cf_scores = pd.DataFrame(cf_scores, index=user_item_matrix.index, columns=user_item_matrix.columns)

    # Initialize Content-Based Filtering
    rest_features = rest_geo[['placeID', 'price', 'alcohol', 'Rambience']].merge(
        rest_cuisine[['placeID', 'Rcuisine']], on='placeID', how='left'
    )
    rest_features['Rcuisine'] = rest_features['Rcuisine'].fillna('Unknown')

    user_ratings = rating[rating['rating'] > 1][['userID', 'placeID']]  # High ratings
    user_features = user_ratings.merge(rest_features, on='placeID')

    encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    feature_columns = ['price', 'alcohol', 'Rambience', 'Rcuisine']
    encoder.fit(rest_features[feature_columns])

    # Encode restaurant features
    encoded_rest_features = encoder.transform(rest_features[feature_columns])
    item_profiles = pd.DataFrame(encoded_rest_features, index=rest_features['placeID'])

    # Encode user features
    if not user_features.empty:
        encoded_user_features = encoder.transform(user_features[feature_columns])
        encoded_user_features_df = pd.DataFrame(encoded_user_features, index=user_features.index)
        encoded_user_features_df['userID'] = user_features['userID']
        user_profiles = encoded_user_features_df.groupby('userID').mean()
    else:
        user_profiles = pd.DataFrame(columns=item_profiles.columns, index=user_item_matrix.index)

    # Align columns
    user_profiles = user_profiles.reindex(columns=item_profiles.columns, fill_value=0)
    user_profiles = user_profiles.fillna(0).replace([np.inf, -np.inf], 0)
    item_profiles = item_profiles.fillna(0).replace([np.inf, -np.inf], 0)

    # Compute CBF scores
    cbf_scores = cosine_similarity(user_profiles, item_profiles)
    cbf_scores_df = pd.DataFrame(cbf_scores, index=user_profiles.index, columns=item_profiles.index)

    # Normalize CBF scores to match CF scale (0-2)
    cbf_scores_df = 2 * (cbf_scores_df - cbf_scores_df.min()) / (cbf_scores_df.max() - cbf_scores_df.min())

    # Compute hybrid scores
    hybrid_scores = 0.6 * cf_scores + 0.4 * cbf_scores_df.reindex(cf_scores.index).fillna(0)

    data_loaded = True
    return True


@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.after_request
def after_request(response):
    """Add CORS headers to all responses"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    """Handle preflight OPTIONS requests"""
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/api/users')
def get_users():
    """Get list of all users"""
    if not load_all_data():
        return jsonify({'error': 'Failed to load data'}), 500
    users = cons_profile['userID'].tolist()
    return jsonify({'users': users})
def get_user_recommendations(user_id, top_n=10):
    """Get hybrid recommendations for a specific user, returning a DataFrame like in the notebook"""
    global hybrid_scores, rest_geo
    if not load_all_data():
        print("Error: Data not loaded")
        return None

    try:
        if user_id not in hybrid_scores.index:
            print(f'User {user_id} not found.')
            return None

        # Get top N recommendations and remove duplicate indices
        recommendations = hybrid_scores.loc[user_id].sort_values(ascending=False).head(top_n)
        recommendations = recommendations[~recommendations.index.duplicated(keep='first')]

        # Filter rest_geo for matching placeIDs and remove duplicates
        result = rest_geo[rest_geo['placeID'].isin(recommendations.index)].drop_duplicates(subset=['placeID']).copy()

        # Map recommendation scores to result DataFrame
        result['Recommendation Score'] = result['placeID'].map(recommendations)

        # Handle NaN in Recommendation Score and round to 2 decimal places
        result['Recommendation Score'] = result['Recommendation Score'].fillna(0).astype(float).round(2)

        # Log for debugging
        print(f"Recommendations for {user_id}: {result[['placeID', 'name', 'Recommendation Score']].to_dict(orient='records')}")

        return result

    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return None

@app.route('/api/recommendations/<user_id>')
def get_recommendations(user_id):
    """Get hybrid recommendations for a specific user"""
    try:
        top_n = request.args.get('top_n', 10, type=int)
        recommendations = get_user_recommendations(user_id, top_n)
        if recommendations is None:
            return jsonify({'error': f'User {user_id} not found or no recommendations available'}), 404

        # Replace NaN with None across the entire DataFrame
        recommendations = recommendations.replace({pd.NA: None, np.nan: None})

        # Convert DataFrame to JSON-compatible format
        recommendations_dict = recommendations.to_dict(orient='records')
        for rec in recommendations_dict:
            rec['placeID'] = int(rec['placeID'])  # Convert placeID to int
            rec['Recommendation Score'] = float(rec['Recommendation Score'])  # Ensure float for score
            # Handle other fields to ensure JSON compatibility
            for key in rec:
                if isinstance(rec[key], (np.int64, np.int32)):
                    rec[key] = int(rec[key])
                elif isinstance(rec[key], (np.float64, np.float32)):
                    rec[key] = float(rec[key])

        return jsonify({
            'user_id': user_id,
            'recommendations': recommendations_dict,
            'count': len(recommendations_dict)
        })
    except Exception as e:
        print(f"Error in recommendations endpoint: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/user/<user_id>')
def get_user_profile(user_id):
    """Get user profile information"""
    if not load_all_data():
        return jsonify({'error': 'Failed to load data'}), 500

    user_info = cons_profile[cons_profile['userID'] == user_id]
    if user_info.empty:
        return jsonify({'error': 'User not found'}), 404

    user = user_info.iloc[0]
    user_cuisines = cons_cuisine[cons_cuisine['userID'] == user_id]['Rcuisine'].tolist()
    user_payments = cons_pay[cons_pay['userID'] == user_id]['Upayment'].tolist()
    user_ratings = rating[rating['userID'] == user_id]

    return jsonify({
        'userID': user_id,
        'profile': {
            'latitude': float(user['latitude']) if pd.notna(user['latitude']) else None,
            'longitude': float(user['longitude']) if pd.notna(user['longitude']) else None,
            'smoker': str(user['smoker']) if pd.notna(user['smoker']) else None,
            'drink_level': str(user['drink_level']) if pd.notna(user['drink_level']) else None,
            'dress_preference': str(user['dress_preference']) if pd.notna(user['dress_preference']) else None,
            'ambience': str(user['ambience']) if pd.notna(user['ambience']) else None,
            'transport': str(user['transport']) if pd.notna(user['transport']) else None,
            'marital_status': str(user['marital_status']) if pd.notna(user['marital_status']) else None,
            'hijos': str(user['hijos']) if pd.notna(user['hijos']) else None,
            'birth_year': int(user['birth_year']) if pd.notna(user['birth_year']) else None,
            'interest': str(user['interest']) if pd.notna(user['interest']) else None,
            'personality': str(user['personality']) if pd.notna(user['personality']) else None,
            'religion': str(user['religion']) if pd.notna(user['religion']) else None,
            'activity': str(user['activity']) if pd.notna(user['activity']) else None,
            'color': str(user['color']) if pd.notna(user['color']) else None,
            'weight': float(user['weight']) if pd.notna(user['weight']) else None,
            'budget': str(user['budget']) if pd.notna(user['budget']) else None,
            'height': float(user['height']) if pd.notna(user['height']) else None
        },
        'cuisine_preferences': user_cuisines,
        'payment_preferences': user_payments,
        'total_ratings': int(len(user_ratings)),
        'average_rating': round(float(user_ratings['rating'].mean()), 2) if len(user_ratings) > 0 else 0
    })

@app.route('/api/restaurants')
def get_restaurants():
    """Get all restaurants with details"""
    if not load_all_data():
        return jsonify({'error': 'Failed to load data'}), 500

    restaurants = []
    for _, restaurant in rest_geo.iterrows():
        place_id = restaurant['placeID']
        cuisine_info = rest_cuisine[rest_cuisine['placeID'] == place_id]
        cuisines = cuisine_info['Rcuisine'].tolist() if not cuisine_info.empty else []
        payment_info = rest_pay[rest_pay['placeID'] == place_id]
        payments = payment_info['Rpayment'].tolist() if not payment_info.empty else []
        parking_info = rest_parking[rest_parking['placeID'] == place_id]
        parking = parking_info['parking_lot'].tolist() if not parking_info.empty else []
        restaurant_ratings = rating[rating['placeID'] == place_id]
        avg_rating = round(float(restaurant_ratings['rating'].mean()), 2) if len(restaurant_ratings) > 0 else 0
        rating_count = len(restaurant_ratings)

        restaurants.append({
            'placeID': int(place_id),
            'name': str(restaurant['name']) if pd.notna(restaurant['name']) else 'N/A',
            'address': str(restaurant['address']) if pd.notna(restaurant['address']) else 'N/A',
            'city': str(restaurant['city']) if pd.notna(restaurant['city']) else 'N/A',
            'state': str(restaurant['state']) if pd.notna(restaurant['state']) else 'N/A',
            'country': str(restaurant['country']) if pd.notna(restaurant['country']) else 'N/A',
            'latitude': float(restaurant['latitude']) if pd.notna(restaurant['latitude']) else None,
            'longitude': float(restaurant['longitude']) if pd.notna(restaurant['longitude']) else None,
            'price': str(restaurant['price']) if pd.notna(restaurant['price']) else 'N/A',
            'alcohol': str(restaurant['alcohol']) if pd.notna(restaurant['alcohol']) else 'N/A',
            'smoking_area': str(restaurant['smoking_area']) if pd.notna(restaurant['smoking_area']) else 'N/A',
            'dress_code': str(restaurant['dress_code']) if pd.notna(restaurant['dress_code']) else 'N/A',
            'accessibility': str(restaurant['accessibility']) if pd.notna(restaurant['accessibility']) else 'N/A',
            'other_services': str(restaurant['other_services']) if pd.notna(restaurant['other_services']) else 'N/A',
            'cuisines': cuisines,
            'payments': payments,
            'parking': parking,
            'average_rating': avg_rating,
            'rating_count': rating_count
        })

    return jsonify({'restaurants': restaurants})

@app.route('/api/restaurant/<int:place_id>')
def get_restaurant_detail(place_id):
    """Get detailed information for a specific restaurant"""
    if not load_all_data():
        return jsonify({'error': 'Failed to load data'}), 500

    restaurant_info = rest_geo[rest_geo['placeID'] == place_id]
    if restaurant_info.empty:
        return jsonify({'error': 'Restaurant not found'}), 404

    restaurant = restaurant_info.iloc[0]
    cuisine_info = rest_cuisine[rest_cuisine['placeID'] == place_id]
    cuisines = cuisine_info['Rcuisine'].tolist() if not cuisine_info.empty else []
    payment_info = rest_pay[rest_pay['placeID'] == place_id]
    payments = payment_info['Rpayment'].tolist() if not payment_info.empty else []
    parking_info = rest_parking[rest_parking['placeID'] == place_id]
    parking = parking_info['parking_lot'].tolist() if not parking_info.empty else []
    hours_info = rest_hours[rest_hours['placeID'] == place_id]
    hours = [{'days': str(hour['days']) if pd.notna(hour['days']) else 'N/A',
              'hours': str(hour['hours']) if pd.notna(hour['hours']) else 'N/A'}
             for _, hour in hours_info.iterrows()]
    restaurant_ratings = rating[rating['placeID'] == place_id]
    reviews = [{'userID': str(review['userID']),
                'rating': int(review['rating']),
                'food_rating': int(review['food_rating']) if pd.notna(review['food_rating']) else None,
                'service_rating': int(review['service_rating']) if pd.notna(review['service_rating']) else None}
               for _, review in restaurant_ratings.iterrows()]
    avg_rating = round(float(restaurant_ratings['rating'].mean()), 2) if len(restaurant_ratings) > 0 else 0

    return jsonify({
        'placeID': int(place_id),
        'name': str(restaurant['name']) if pd.notna(restaurant['name']) else 'N/A',
        'address': str(restaurant['address']) if pd.notna(restaurant['address']) else 'N/A',
        'city': str(restaurant['city']) if pd.notna(restaurant['city']) else 'N/A',
        'state': str(restaurant['state']) if pd.notna(restaurant['state']) else 'N/A',
        'country': str(restaurant['country']) if pd.notna(restaurant['country']) else 'N/A',
        'latitude': float(restaurant['latitude']) if pd.notna(restaurant['latitude']) else None,
        'longitude': float(restaurant['longitude']) if pd.notna(restaurant['longitude']) else None,
        'price': str(restaurant['price']) if pd.notna(restaurant['price']) else 'N/A',
        'alcohol': str(restaurant['alcohol']) if pd.notna(restaurant['alcohol']) else 'N/A',
        'smoking_area': str(restaurant['smoking_area']) if pd.notna(restaurant['smoking_area']) else 'N/A',
        'dress_code': str(restaurant['dress_code']) if pd.notna(restaurant['dress_code']) else 'N/A',
        'accessibility': str(restaurant['accessibility']) if pd.notna(restaurant['accessibility']) else 'N/A',
        'other_services': str(restaurant['other_services']) if pd.notna(restaurant['other_services']) else 'N/A',
        'cuisines': cuisines,
        'payments': payments,
        'parking': parking,
        'hours': hours,
        'average_rating': avg_rating,
        'rating_count': len(restaurant_ratings),
        'reviews': reviews
    })

@app.route('/api/stats')
def get_stats():
    """Get overall statistics"""
    if not load_all_data():
        return jsonify({'error': 'Failed to load data'}), 500

    total_users = len(cons_profile)
    total_restaurants = len(rest_geo)
    total_reviews = len(rating)
    cuisine_counts = cons_cuisine['Rcuisine'].value_counts().to_dict()
    payment_counts = cons_pay['Upayment'].value_counts().to_dict()
    restaurant_cuisine_counts = rest_cuisine['Rcuisine'].value_counts().to_dict()

    return jsonify({
        'total_users': total_users,
        'total_restaurants': total_restaurants,
        'total_reviews': total_reviews,
        'user_cuisine_preferences': cuisine_counts,
        'user_payment_preferences': payment_counts,
        'restaurant_cuisines': restaurant_cuisine_counts
    })

@app.route('/api/users/all')
def get_all_users():
    """Get all users with basic information"""
    if not load_all_data():
        return jsonify({'error': 'Failed to load data'}), 500

    users = []
    for _, user in cons_profile.iterrows():
        user_id = user['userID']
        user_ratings = rating[rating['userID'] == user_id]
        user_cuisines = cons_cuisine[cons_cuisine['userID'] == user_id]['Rcuisine'].tolist()

        users.append({
            'userID': str(user_id),
            'latitude': float(user['latitude']) if pd.notna(user['latitude']) else None,
            'longitude': float(user['longitude']) if pd.notna(user['longitude']) else None,
            'smoker': str(user['smoker']) if pd.notna(user['smoker']) else None,
            'drink_level': str(user['drink_level']) if pd.notna(user['drink_level']) else None,
            'dress_preference': str(user['dress_preference']) if pd.notna(user['dress_preference']) else None,
            'ambience': str(user['ambience']) if pd.notna(user['ambience']) else None,
            'transport': str(user['transport']) if pd.notna(user['transport']) else None,
            'marital_status': str(user['marital_status']) if pd.notna(user['marital_status']) else None,
            'birth_year': int(user['birth_year']) if pd.notna(user['birth_year']) else None,
            'budget': str(user['budget']) if pd.notna(user['budget']) else None,
            'total_ratings': len(user_ratings),
            'average_rating': round(float(user_ratings['rating'].mean()), 2) if len(user_ratings) > 0 else 0,
            'cuisine_preferences': user_cuisines[:3]  # Show top 3 preferences
        })

    return jsonify({'users': users})

@app.route('/api/evaluate')
def evaluate_model():
    """Evaluate the hybrid model with RMSE and Precision@K"""
    if not load_all_data():
        return jsonify({'error': 'Failed to load data'}), 500

    try:
        # Split data into train and test (80-20)
        np.random.seed(42)
        test_indices = np.random.choice(rating.index, size=int(0.2 * len(rating)), replace=False)
        test_set = rating.loc[test_indices]
        train_set = rating.drop(test_indices)

        # Recreate rating matrix for training
        train_rating_matrix = train_set.pivot_table(
            index='userID',
            columns='placeID',
            values='rating',
            fill_value=0
        )
        train_user_similarity = cosine_similarity(train_rating_matrix)
        train_user_similarity_df = pd.DataFrame(
            train_user_similarity,
            index=train_rating_matrix.index,
            columns=train_rating_matrix.index
        )
        sim_sums = train_user_similarity_df.abs().sum(axis=1).replace(0, 1)
        train_cf_scores = np.dot(train_user_similarity_df, train_rating_matrix) / sim_sums.values[:, np.newaxis]
        train_cf_scores = pd.DataFrame(train_cf_scores, index=train_rating_matrix.index, columns=train_rating_matrix.columns)

        # RMSE
        predictions = []
        true_ratings = []
        for _, row in test_set.iterrows():
            user_id, item_id, true_rating = row['userID'], row['placeID'], row['rating']
            if user_id in hybrid_scores.index and item_id in hybrid_scores.columns:
                pred_score = hybrid_scores.loc[user_id, item_id]
                if isinstance(pred_score, (int, float)) and isinstance(true_rating, (int, float)):
                    predictions.append(float(pred_score))
                    true_ratings.append(float(true_rating))

        rmse = np.sqrt(mean_squared_error(true_ratings, predictions)) if predictions else 0

        # Precision@K
        K = 10
        precision_sum = 0
        user_count = 0
        list_users = rating['userID'].unique()
        for user_id in list_users:
            if user_id in hybrid_scores.index:
                user_recs = hybrid_scores.loc[user_id].sort_values(ascending=False).head(K).index
                relevant_items = rating[(rating['userID'] == user_id) & (rating['rating'] > 1)]['placeID']
                hits = len(set(user_recs).intersection(set(relevant_items)))
                precision_sum += hits / K
                user_count += 1

        precision_at_k = precision_sum / user_count if user_count > 0 else 0

        return jsonify({
            'rmse': round(rmse, 4) if rmse else 'N/A',
            'precision_at_10': round(precision_at_k, 4) if user_count > 0 else 'N/A'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)