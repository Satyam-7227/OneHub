import React, { useState, useEffect } from 'react';
import './RecipeFinder.css';

const RecipeFinder = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userPreferences, setUserPreferences] = useState({});
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [showNoResultsModal, setShowNoResultsModal] = useState(false);
    const [noResultsMessage, setNoResultsMessage] = useState('');
    const [noResultsQuery, setNoResultsQuery] = useState('');
    const [requestFormData, setRequestFormData] = useState({
        recipe_name: '',
        cuisine: '',
        dietary_preferences: [],
        description: ''
    });

    const fetchRecipes = async (query = '') => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('auth_token');
            const url = query 
                ? `http://localhost:5000/api/recipes?query=${encodeURIComponent(query)}`
                : 'http://localhost:5000/api/recipes';
                
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch recipes');
            }

            const data = await response.json();
            
            // Handle no results case
            if (data.no_results) {
                // Show proper modal instead of alert
                setNoResultsMessage(data.message);
                setNoResultsQuery(query);
                setShowNoResultsModal(true);
                return;
            }
            
            setRecipes(data.recipes || []);
            setUserPreferences(data.user_preferences || {});
        } catch (err) {
            setError(err.message);
            console.error('Recipe fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            fetchRecipes(searchQuery.trim());
        } else {
            fetchRecipes();
        }
    };

    const openRecipeModal = (recipe) => {
        setSelectedRecipe(recipe);
    };

    const closeRecipeModal = () => {
        setSelectedRecipe(null);
    };

    const showRecipeRequestForm = (recipeName) => {
        setRequestFormData({
            recipe_name: recipeName,
            cuisine: userPreferences.cuisines?.[0] || '',
            dietary_preferences: userPreferences.dietary || [],
            description: ''
        });
        setShowRequestForm(true);
        setShowNoResultsModal(false);
    };

    const closeRequestForm = () => {
        setShowRequestForm(false);
        setRequestFormData({
            recipe_name: '',
            cuisine: '',
            dietary_preferences: [],
            description: ''
        });
    };

    const closeNoResultsModal = () => {
        setShowNoResultsModal(false);
        setSearchQuery('');
        // Reload recipes without query
        setTimeout(() => {
            fetchRecipes('');
        }, 1000);
    };

    const handleRequestRecipe = () => {
        showRecipeRequestForm(noResultsQuery);
    };

    const handleRequestFormSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:5000/api/recipe-request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestFormData)
            });

            if (response.ok) {
                await response.json(); // Response is not used, just need to consume the stream
                alert('Recipe request submitted successfully! We\'ll try to add it to our database.');
                closeRequestForm();
                setSearchQuery('');
                // Reload recipes without query
                setTimeout(() => {
                    fetchRecipes('');
                }, 1000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert('Failed to submit recipe request: ' + (errorData.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Failed to submit recipe request: ' + err.message);
        }
    };

    const formatCookingTime = (minutes) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        }
        return `${minutes}m`;
    };

    const formatDietary = (dietary) => {
        if (!dietary || dietary.length === 0) return null;
        return dietary.slice(0, 2).map(diet => 
            diet.charAt(0).toUpperCase() + diet.slice(1)
        ).join(', ');
    };

    if (loading) {
        return (
            <div className="recipe-finder">
                <div className="recipe-header">
                    <h1>Recipe Finder</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading delicious recipes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recipe-finder">
                <div className="recipe-header">
                    <h1>Recipe Finder</h1>
                </div>
                <div className="error-container">
                    <p className="error-message">Error: {error}</p>
                    <button onClick={() => fetchRecipes()} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="recipe-finder">
            <div className="recipe-header">
                <div className="header-content">
                    <h1>Recipe Finder</h1>
                    {userPreferences && (
                        <div className="preferences-info">
                            {userPreferences.cuisines && userPreferences.cuisines.length > 0 && (
                                <span className="preference-tag">
                                    Cuisines: {userPreferences.cuisines.slice(0, 2).join(', ')}
                                </span>
                            )}
                            {userPreferences.dietary && userPreferences.dietary.length > 0 && (
                                <span className="preference-tag">
                                    Diet: {userPreferences.dietary.slice(0, 2).join(', ')}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search for recipes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">Search</button>
                </form>
            </div>

            <div className="recipes-grid">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className="recipe-card" onClick={() => openRecipeModal(recipe)}>
                        <div className="recipe-image-container">
                            <img 
                                src={recipe.image || 'https://via.placeholder.com/300x200/f39c12/ffffff?text=Recipe'}
                                alt={recipe.title}
                                className="recipe-image"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x200/f39c12/ffffff?text=Recipe';
                                }}
                            />
                            <div className="recipe-overlay">
                                <span className="view-recipe">View Recipe</span>
                            </div>
                        </div>
                        <div className="recipe-content">
                            <h3 className="recipe-title">{recipe.title}</h3>
                            <div className="recipe-meta">
                                <div className="meta-item">
                                    <span className="meta-icon">⏱️</span>
                                    <span>{formatCookingTime(recipe.ready_in_minutes)}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">👥</span>
                                    <span>{recipe.servings} servings</span>
                                </div>
                            </div>
                            {formatDietary(recipe.dietary) && (
                                <div className="dietary-tags">
                                    {formatDietary(recipe.dietary)}
                                </div>
                            )}
                            {recipe.nutrition && recipe.nutrition.calories && (
                                <div className="nutrition-info">
                                    {Math.round(recipe.nutrition.calories)} cal
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {recipes.length === 0 && !loading && (
                <div className="no-recipes">
                    <p>No recipes found. Try a different search term!</p>
                </div>
            )}

            {selectedRecipe && (
                <div className="recipe-modal-overlay" onClick={closeRecipeModal}>
                    <div className="recipe-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedRecipe.title}</h2>
                            <button className="close-btn" onClick={closeRecipeModal}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="modal-image">
                                <img 
                                    src={selectedRecipe.image || 'https://via.placeholder.com/400x300/f39c12/ffffff?text=Recipe'}
                                    alt={selectedRecipe.title}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300/f39c12/ffffff?text=Recipe';
                                    }}
                                />
                            </div>
                            <div className="modal-details">
                                <div className="recipe-info">
                                    <div className="info-item">
                                        <strong>Cooking Time:</strong> {formatCookingTime(selectedRecipe.ready_in_minutes)}
                                    </div>
                                    <div className="info-item">
                                        <strong>Servings:</strong> {selectedRecipe.servings}
                                    </div>
                                    {selectedRecipe.cuisine && Array.isArray(selectedRecipe.cuisine) && selectedRecipe.cuisine.length > 0 && (
                                        <div className="info-item">
                                            <strong>Cuisine:</strong> {selectedRecipe.cuisine.slice(0, 2).join(', ')}
                                        </div>
                                    )}
                                    {selectedRecipe.cuisine && typeof selectedRecipe.cuisine === 'string' && (
                                        <div className="info-item">
                                            <strong>Cuisine:</strong> {selectedRecipe.cuisine}
                                        </div>
                                    )}
                                    {formatDietary(selectedRecipe.dietary) && (
                                        <div className="info-item">
                                            <strong>Dietary:</strong> {formatDietary(selectedRecipe.dietary)}
                                        </div>
                                    )}
                                </div>
                                
                                {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                                    <div className="ingredients-section">
                                        <h3>Ingredients</h3>
                                        <ul className="ingredients-list">
                                            {selectedRecipe.ingredients.map((ingredient, index) => (
                                                <li key={index}>{ingredient}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {selectedRecipe.instructions && (
                                    <div className="instructions-section">
                                        <h3>Instructions</h3>
                                        <div className="instructions-content">
                                            {selectedRecipe.instructions}
                                        </div>
                                    </div>
                                )}
                                
                                {selectedRecipe.nutrition && Object.keys(selectedRecipe.nutrition).length > 0 && (
                                    <div className="nutrition-section">
                                        <h3>Nutrition (per serving)</h3>
                                        <div className="nutrition-grid">
                                            {selectedRecipe.nutrition.calories && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Calories</span>
                                                    <span className="nutrition-value">{Math.round(selectedRecipe.nutrition.calories)}</span>
                                                </div>
                                            )}
                                            {selectedRecipe.nutrition.protein && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Protein</span>
                                                    <span className="nutrition-value">{selectedRecipe.nutrition.protein}</span>
                                                </div>
                                            )}
                                            {selectedRecipe.nutrition.carbs && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Carbs</span>
                                                    <span className="nutrition-value">{selectedRecipe.nutrition.carbs}</span>
                                                </div>
                                            )}
                                            {selectedRecipe.nutrition.fat && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Fat</span>
                                                    <span className="nutrition-value">{selectedRecipe.nutrition.fat}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {selectedRecipe.source_url && (
                                    <div className="source-section">
                                        <a 
                                            href={selectedRecipe.source_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="source-link"
                                        >
                                            View Original Recipe
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Results Modal */}
            {showNoResultsModal && (
                <div className="modal-overlay" onClick={closeNoResultsModal}>
                    <div className="no-results-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔍 No Recipes Found</h2>
                            <button className="close-btn" onClick={closeNoResultsModal}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="no-results-content">
                                <div className="no-results-icon">
                                    <span>🍽️</span>
                                </div>
                                <p className="no-results-message">{noResultsMessage}</p>
                                <p className="no-results-suggestion">
                                    Would you like to request this recipe? We'll try to add it to our database for you and other users.
                                </p>
                                <div className="modal-actions">
                                    <button onClick={closeNoResultsModal} className="secondary-btn">
                                        Try Different Search
                                    </button>
                                    <button onClick={handleRequestRecipe} className="primary-btn">
                                        Request Recipe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recipe Request Form Modal */}
            {showRequestForm && (
                <div className="modal-overlay" onClick={closeRequestForm}>
                    <div className="request-form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📝 Request a Recipe</h2>
                            <button className="close-btn" onClick={closeRequestForm}>×</button>
                        </div>
                        <div className="modal-content">
                            <form onSubmit={handleRequestFormSubmit} className="modern-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="recipe_name">Recipe Name *</label>
                                        <input
                                            type="text"
                                            id="recipe_name"
                                            value={requestFormData.recipe_name}
                                            onChange={(e) => setRequestFormData({
                                                ...requestFormData,
                                                recipe_name: e.target.value
                                            })}
                                            required
                                            placeholder="e.g., Chicken Tikka Masala"
                                            className="modern-input"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="cuisine">Cuisine Type *</label>
                                        <select
                                            id="cuisine"
                                            value={requestFormData.cuisine}
                                            onChange={(e) => setRequestFormData({
                                                ...requestFormData,
                                                cuisine: e.target.value
                                            })}
                                            required
                                            className="modern-select"
                                        >
                                            <option value="">Select Cuisine</option>
                                            <option value="indian">🇮🇳 Indian</option>
                                            <option value="chinese">🇨🇳 Chinese</option>
                                            <option value="italian">🇮🇹 Italian</option>
                                            <option value="mexican">🇲🇽 Mexican</option>
                                            <option value="french">🇫🇷 French</option>
                                            <option value="american">🇺🇸 American</option>
                                            <option value="thai">🇹🇭 Thai</option>
                                            <option value="japanese">🇯🇵 Japanese</option>
                                            <option value="mediterranean">🌊 Mediterranean</option>
                                            <option value="other">🌍 Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Dietary Preferences</label>
                                    <div className="checkbox-grid">
                                        {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto'].map(diet => (
                                            <label key={diet} className="modern-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={requestFormData.dietary_preferences.includes(diet.toLowerCase())}
                                                    onChange={(e) => {
                                                        const dietLower = diet.toLowerCase();
                                                        if (e.target.checked) {
                                                            setRequestFormData({
                                                                ...requestFormData,
                                                                dietary_preferences: [...requestFormData.dietary_preferences, dietLower]
                                                            });
                                                        } else {
                                                            setRequestFormData({
                                                                ...requestFormData,
                                                                dietary_preferences: requestFormData.dietary_preferences.filter(d => d !== dietLower)
                                                            });
                                                        }
                                                    }}
                                                />
                                                <span className="checkmark"></span>
                                                {diet}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Additional Details</label>
                                    <textarea
                                        id="description"
                                        value={requestFormData.description}
                                        onChange={(e) => setRequestFormData({
                                            ...requestFormData,
                                            description: e.target.value
                                        })}
                                        placeholder="Tell us more about this recipe - ingredients, cooking style, special requirements..."
                                        rows="4"
                                        className="modern-textarea"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={closeRequestForm} className="cancel-btn">
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        <span>📤</span>
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeFinder;
