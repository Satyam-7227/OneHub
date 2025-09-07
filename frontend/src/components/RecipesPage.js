import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ApiService from '../api/api';
import { FiArrowLeft, FiSearch, FiClock, FiUsers } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #1a202c;
  color: white;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 25px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;


const RecipesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const RecipeCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const RecipeImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.image ? `url(${props.image})` : '#4a5568'};
  background-size: cover;
  background-position: center;
  border-radius: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
`;

const RecipeTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.3;
`;

const RecipeDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 15px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RecipeMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 15px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RecipeLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  color: white;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  color: #ff6b6b;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  color: white;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalContent = styled.div`
  padding: 25px;
`;

const ModalImage = styled.div`
  width: 100%;
  height: 250px;
  background: ${props => props.image ? `url(${props.image})` : '#4a5568'};
  background-size: cover;
  background-position: center;
  border-radius: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
`;

const RecipeInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
`;

const InfoItem = styled.div`
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
`;

const InstructionsSection = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
`;

const Instructions = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
`;

const NutritionItem = styled.div`
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const NutritionLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
`;

const NutritionValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
`;

const ViewOriginalButton = styled.button`
  width: 100%;
  padding: 15px 25px;
  background: #4299e1;
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 107, 53, 0.3);
  }
`;

function RecipesPage({ onBack }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const fetchRecipes = async (query = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ApiService.getRecipes(query);
      setRecipes(data.recipes || []);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleSearch = () => {
    fetchRecipes(searchQuery.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
  };

  const handleViewOriginal = (recipe) => {
    if (recipe.source_url) {
      window.open(recipe.source_url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatCookingTime = (minutes) => {
    if (!minutes) return '30m';
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

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={onBack}>
          <FiArrowLeft />
          Back to Dashboard
        </BackButton>
        <Title>
          <FaUtensils />
          Recipes
        </Title>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search for recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton onClick={handleSearch}>
          <FiSearch />
          Search
        </SearchButton>
      </SearchContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner>Loading delicious recipes...</LoadingSpinner>
      ) : recipes.length > 0 ? (
        <RecipesGrid>
          {recipes.map((recipe, index) => (
            <RecipeCard key={index} onClick={() => handleRecipeClick(recipe)}>
              <RecipeImage image={recipe.image}>
                {!recipe.image && '🍽️'}
              </RecipeImage>
              <RecipeTitle>{recipe.title || recipe.name || 'Delicious Recipe'}</RecipeTitle>
              <RecipeDescription>
                {recipe.description || recipe.summary || 'A wonderful recipe that will delight your taste buds with its amazing flavors and simple preparation.'}
              </RecipeDescription>
              <RecipeMeta>
                <MetaItem>
                  <FiClock />
                  {recipe.cook_time || recipe.ready_in_minutes || '30'} min
                </MetaItem>
                <MetaItem>
                  <FiUsers />
                  {recipe.servings || '4'} servings
                </MetaItem>
              </RecipeMeta>
              <RecipeLink as="div" onClick={(e) => { e.stopPropagation(); handleRecipeClick(recipe); }}>
                View Recipe →
              </RecipeLink>
            </RecipeCard>
          ))}
        </RecipesGrid>
      ) : (
        <EmptyState>
          <h3>No recipes found</h3>
          <p>Try searching for different ingredients or recipe types.</p>
        </EmptyState>
      )}

      {selectedRecipe && (
        <ModalOverlay onClick={closeRecipeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedRecipe.title || selectedRecipe.name || 'Recipe Details'}</ModalTitle>
              <CloseButton onClick={closeRecipeModal}>×</CloseButton>
            </ModalHeader>
            <ModalContent>
              <ModalImage image={selectedRecipe.image}>
                {!selectedRecipe.image && '🍽️'}
              </ModalImage>
              
              <RecipeInfo>
                <InfoItem>
                  <InfoLabel>Cooking Time</InfoLabel>
                  <InfoValue>{formatCookingTime(selectedRecipe.ready_in_minutes || selectedRecipe.cook_time)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Servings</InfoLabel>
                  <InfoValue>{selectedRecipe.servings || '4'}</InfoValue>
                </InfoItem>
                {selectedRecipe.cuisine && (
                  <InfoItem>
                    <InfoLabel>Cuisine</InfoLabel>
                    <InfoValue>
                      {Array.isArray(selectedRecipe.cuisine) 
                        ? selectedRecipe.cuisine.slice(0, 2).join(', ') 
                        : selectedRecipe.cuisine}
                    </InfoValue>
                  </InfoItem>
                )}
                {formatDietary(selectedRecipe.dietary) && (
                  <InfoItem>
                    <InfoLabel>Dietary</InfoLabel>
                    <InfoValue>{formatDietary(selectedRecipe.dietary)}</InfoValue>
                  </InfoItem>
                )}
              </RecipeInfo>

              {selectedRecipe.instructions && (
                <InstructionsSection>
                  <SectionTitle>Instructions</SectionTitle>
                  <Instructions>
                    {selectedRecipe.instructions}
                  </Instructions>
                </InstructionsSection>
              )}

              {selectedRecipe.nutrition && Object.keys(selectedRecipe.nutrition).length > 0 && (
                <div>
                  <SectionTitle>Nutrition (per serving)</SectionTitle>
                  <NutritionGrid>
                    {selectedRecipe.nutrition.calories && (
                      <NutritionItem>
                        <NutritionLabel>Calories</NutritionLabel>
                        <NutritionValue>{Math.round(selectedRecipe.nutrition.calories)}</NutritionValue>
                      </NutritionItem>
                    )}
                    {selectedRecipe.nutrition.protein && (
                      <NutritionItem>
                        <NutritionLabel>Protein</NutritionLabel>
                        <NutritionValue>{selectedRecipe.nutrition.protein}</NutritionValue>
                      </NutritionItem>
                    )}
                    {selectedRecipe.nutrition.carbs && (
                      <NutritionItem>
                        <NutritionLabel>Carbs</NutritionLabel>
                        <NutritionValue>{selectedRecipe.nutrition.carbs}</NutritionValue>
                      </NutritionItem>
                    )}
                    {selectedRecipe.nutrition.fat && (
                      <NutritionItem>
                        <NutritionLabel>Fat</NutritionLabel>
                        <NutritionValue>{selectedRecipe.nutrition.fat}</NutritionValue>
                      </NutritionItem>
                    )}
                  </NutritionGrid>
                </div>
              )}

              {selectedRecipe.source_url && (
                <ViewOriginalButton onClick={() => handleViewOriginal(selectedRecipe)}>
                  View Original Recipe
                </ViewOriginalButton>
              )}
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}

export default RecipesPage;
