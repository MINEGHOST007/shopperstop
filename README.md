# Personal Shopping Assistant with Tavus Avatar

An AI-powered personal shopping assistant that helps customers find the perfect products using voice interactions and an interactive avatar. Built with LiveKit agents and powered by Google's Gemini LLM.

## Features

### 🛍️ Smart Product Search
- **Intelligent Search**: Uses fuzzy matching with difflib to find products based on keywords, descriptions, categories, and brands
- **Category Browsing**: Browse products by specific categories (beauty, electronics, clothing, etc.)
- **Price Range Filtering**: Find products within specific budget constraints
- **Top Discounts**: Discover the best deals and highest discount percentages

### 🃏 Interactive Product Cards
- **Visual Product Display**: Show detailed product cards with images, prices, ratings, and descriptions
- **Discount Highlighting**: Clearly display original prices, discounted prices, and savings
- **Stock Information**: Real-time stock availability and shipping details

### 🎯 Product Selection Quiz (Tinder for Products)
- **Swipeable Product Discovery**: Fun, Tinder-like interface for product discovery
- **Personalized Recommendations**: Learn user preferences through their likes/dislikes
- **Discount Rewards**: Users get 5% discount when they like 3+ products
- **Preference Learning**: Build user preference profiles based on selections

### 🎭 Avatar Integration
- **Tavus Avatar**: Interactive AI avatar for natural conversations
- **Voice Interactions**: Full voice-based shopping experience
- **Real-time Communication**: WebRTC for seamless audio/video communication

## Product Database

The system includes a comprehensive product database with:
- **11,000+ Products** across multiple categories
- **Categories**: Beauty, Electronics, Clothing, Home & Garden, Groceries, and more
- **Rich Product Data**: Titles, descriptions, prices, ratings, reviews, stock levels
- **Brand Information**: Products from various popular brands
- **Discount Information**: Real-time pricing and discount percentages

## Tools Available to the AI Assistant

1. **search_products**: Find products using keywords and fuzzy matching
2. **get_top_discounts**: Show products with highest discount percentages
3. **get_products_by_category**: Browse specific product categories
4. **get_products_in_price_range**: Filter products by budget
5. **create_product_card**: Display detailed product information
6. **create_product_selection_quiz**: Create interactive product discovery experience

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tavus
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   Create a `.env` file in the parent directory with:
   ```env
   LIVEKIT_URL=your_livekit_url
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_secret
   GOOGLE_API_KEY=your_gemini_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   ELEVEN_API_KEY=your_api_key
   TAVUS_API_KEY=your_tavus_api_key
   ```

4. **Product Data**
   Ensure `products.json` is in the root directory (already included)

5. **Run the application**
   ```bash
   python tavus.py download-files
   python tavus.py dev
   ```

## Architecture

### Agent System
- **PersonalShopperAgent**: Main AI agent with Gemini LLM integration
- **Product Loading**: Loads and indexes products from JSON database
- **Search Engine**: Implements fuzzy search using Python's difflib
- **User Preference Tracking**: Builds user profiles based on interactions

### Frontend Integration
The agent communicates with frontend clients via RPC methods:
- `client.productcard`: Send product card data to display
- `client.productquiz`: Send product selection quiz data
- `agent.productCardAction`: Handle product card interactions
- `agent.submitProductQuiz`: Process product quiz submissions

### Voice Assistant Capabilities
- **Conversational AI**: Natural language understanding for shopping queries
- **Product Recommendations**: Context-aware product suggestions
- **Deal Highlighting**: Enthusiastic communication about discounts and savings
- **Interactive Guidance**: Helps users navigate product choices

## Usage Examples

### Voice Commands the Assistant Understands:
- "Show me the best discounts available"
- "I'm looking for beauty products under $20"
- "Find me some electronics"
- "Create a product quiz for clothing items"
- "What laptops do you have in stock?"

### Product Selection Process:
1. User expresses interest in a product category
2. Assistant searches and presents options
3. User can request product cards for detailed information
4. Assistant can create product selection quiz for discovery
5. Users earn discounts by engaging with the selection process

## Technical Stack

- **LiveKit Agents**: Real-time voice agent framework
- **Google Gemini**: Advanced language model for natural conversations
- **Tavus**: AI avatar platform for visual representation
- **ElevenLabs**: High-quality text-to-speech
- **Deepgram**: Speech-to-text recognition
- **Python**: Core application language
- **difflib**: Fuzzy string matching for search
- **WebRTC**: Real-time communication protocol

## Customization

### Adding New Products
Update the `products.json` file with new product data following the existing schema:
```json
{
  "id": 1,
  "title": "Product Name",
  "description": "Product description",
  "category": "category-name",
  "price": 99.99,
  "discountPercentage": 10.5,
  "rating": 4.5,
  "stock": 100,
  "brand": "Brand Name",
  "tags": ["tag1", "tag2"],
  "thumbnail": "image-url"
}
```

### Modifying AI Behavior
Update the system instructions in `PersonalShopperAgent.__init__()` to change:
- Conversation style and personality
- Product recommendation strategies
- Discount and promotion emphasis
- User interaction patterns

### Frontend Integration
The system is designed to work with various frontend frameworks. Implement the RPC methods:
- Handle `client.productcard` to display product information
- Handle `client.productquiz` to show product selection interface
- Send `agent.productCardAction` for user interactions
- Send `agent.submitProductQuiz` with user selections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
