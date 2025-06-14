import logging
import json
import uuid
import difflib
import random
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, List, Dict, Any, TypedDict
from dotenv import load_dotenv
from livekit.agents import JobContext, WorkerOptions, cli, WorkerPermissions, RoomOutputOptions
from livekit.agents.llm import function_tool
from livekit.agents.voice import Agent, AgentSession, RunContext
from livekit.plugins.turn_detector.english import EnglishModel
from livekit.plugins import openai, silero, deepgram, tavus, elevenlabs, rime, turn_detector, google
import asyncio

load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

logger = logging.getLogger("avatar")
logger.setLevel(logging.INFO)

# Load products from JSON
def load_products():
    """Load products from products.json file."""
    try:
        with open('products.json', 'r') as f:
            data = json.load(f)
            return data.get('products', [])
    except Exception as e:
        logger.error(f"Error loading products: {e}")
        return []

# Global products list
PRODUCTS = load_products()

class ProductRecommendationDict(TypedDict):
    product_id: int
    title: str
    description: str
    price: float
    discount_percentage: float
    category: str
    rating: float

class ProductSelectionDict(TypedDict):
    product_id: int
    title: str
    price: float
    image: str
    liked: bool

@dataclass
class ProductCard:
    """Class to represent a product card for display."""
    id: str
    product_id: int
    title: str 
    price: float
    image: str
    description: str
    category: str
    rating: float
    discount_percentage: float

@dataclass
class ProductQuiz:
    """Class to represent a product selection quiz (like Tinder for products)."""
    id: str
    products: List[ProductCard]
    discount_percentage: float = 5.0

@dataclass
class UserData:
    """Class to store user data during a session."""
    ctx: Optional[JobContext] = None
    product_cards: List[ProductCard] = field(default_factory=list)
    product_quizzes: List[ProductQuiz] = field(default_factory=list)
    user_preferences: Dict[str, List[str]] = field(default_factory=dict)

    def reset(self) -> None:
        """Reset session data."""
        # Keep product cards and preferences

    def add_product_card(self, product: dict) -> ProductCard:
        """Add a new product card to the collection."""
        card = ProductCard(
            id=str(uuid.uuid4()),
            product_id=product['id'],
            title=product['title'],
            price=product['price'],
            image=product.get('thumbnail', ''),
            description=product['description'],
            category=product['category'],
            rating=product['rating'],
            discount_percentage=product['discountPercentage']
        )
        self.product_cards.append(card)
        return card
    
    def get_product_card(self, card_id: str) -> Optional[ProductCard]:
        """Get a product card by ID."""
        for card in self.product_cards:
            if card.id == card_id:
                return card
        return None
    
    def add_product_quiz(self, products: List[dict]) -> ProductQuiz:
        """Add a new product selection quiz."""
        quiz_products = []
        for product in products:
            card = ProductCard(
                id=str(uuid.uuid4()),
                product_id=product['id'],
                title=product['title'],
                price=product['price'],
                image=product.get('thumbnail', ''),
                description=product['description'],
                category=product['category'],
                rating=product['rating'],
                discount_percentage=product['discountPercentage']
            )
            quiz_products.append(card)
        
        quiz = ProductQuiz(
            id=str(uuid.uuid4()),
            products=quiz_products
        )
        self.product_quizzes.append(quiz)
        return quiz
    
    def get_product_quiz(self, quiz_id: str) -> Optional[ProductQuiz]:
        """Get a product quiz by ID."""
        for quiz in self.product_quizzes:
            if quiz.id == quiz_id:
                return quiz
        return None
    
    def process_product_selections(self, quiz_id: str, selections: dict) -> List[dict]:
        """Process product selections from quiz."""
        quiz = self.get_product_quiz(quiz_id)
        if not quiz:
            return []
        
        liked_products = []
        for product in quiz.products:
            selection = selections.get(product.id)
            if selection and selection.get('liked', False):
                liked_products.append({
                    'product_id': product.product_id,
                    'title': product.title,
                    'category': product.category,
                    'price': product.price
                })
                
                # Update user preferences based on liked products
                category = product.category
                if category not in self.user_preferences:
                    self.user_preferences[category] = []
                if product.title not in self.user_preferences[category]:
                    self.user_preferences[category].append(product.title)
        
        return liked_products

class PersonalShopperAgent(Agent):
    def __init__(self) -> None:
        # Create a comprehensive products summary for the system instructions
        categories = set(p['category'] for p in PRODUCTS)
        brands = set(p.get('brand', 'Unknown') for p in PRODUCTS if p.get('brand'))
        price_range = f"${min(p['price'] for p in PRODUCTS):.2f} - ${max(p['price'] for p in PRODUCTS):.2f}" if PRODUCTS else "$0 - $0"
        
        products_summary = f"""
        AVAILABLE PRODUCTS DATABASE:
        Total Products: {len(PRODUCTS)}
        Categories: {', '.join(sorted(categories))}
        Top Brands: {', '.join(sorted(list(brands))[:20])}
        Price Range: {price_range}
        
        Key product information includes: title, description, category, price, discount percentage, rating, stock, brand, tags, reviews, and images.
        """
        
        super().__init__(
            instructions=f"""
                You are Sarah, a highly knowledgeable and enthusiastic personal shopping assistant with access to an extensive product database.
                Your primary goal is to help customers find the perfect products based on their needs, preferences, and budget.

                {products_summary}

                Your responsibilities include:
                • Understanding customer needs through thoughtful questions about their preferences, budget, style, and requirements
                • Using your product search tools to find relevant items that match their criteria
                • Providing detailed product recommendations with pricing, features, and benefits
                • Highlighting special discounts and deals available
                • Creating product selection quizzes (like Tinder for products) where customers can swipe through products - if they like enough products, they get a 5% discount!
                • Offering alternatives and comparisons between similar products
                • Explaining product features, benefits, and why they're good matches
                • Being enthusiastic about great deals and helping customers save money

                TOOLS AT YOUR DISPOSAL:
                • search_products: Find products based on keywords, categories, or descriptions
                • get_top_discounts: Show products with the highest discount percentages
                • get_products_by_category: Browse products in specific categories
                • get_products_in_price_range: Find products within a specific budget
                • create_product_selection_quiz: Create a fun product selection experience with discount rewards
                • create_product_card: Show individual product recommendations

                PRODUCT SELECTION QUIZ FEATURE:
                You can create engaging product selection quizzes where customers swipe through products like Tinder.
                If they like at least 3 products, they unlock a 5% discount on their next purchase!
                This is a fun way to understand their preferences while offering value.

                CONVERSATION STYLE:
                • Be conversational, friendly, and excited about helping customers find great products
                • Ask follow-up questions to better understand their needs
                • Share interesting details about products (reviews, unique features, great deals)
                • Keep responses concise but informative - this is a voice conversation
                • Celebrate great deals and matches with enthusiasm
                • Always mention prices and any available discounts

                Start the conversation by introducing yourself and asking what they're shopping for today!
                Keep your speaking turns short, only one or two sentences. We want the customer to engage actively.
            """,
            stt=deepgram.STT(),
            llm=google.LLM(model="gemini-1.5-flash"),
            tts=elevenlabs.TTS(
                voice_id="21m00Tcm4TlvDq8ikWAM"
            ),
            vad=silero.VAD.load(),
        )

    @function_tool
    async def search_products(self, context: RunContext[UserData], query: str, limit: int = 5) -> str:
        """Search for products using fuzzy matching on titles, descriptions, and tags.

        Args:
            query: Search query (keywords, product name, or description)
            limit: Maximum number of products to return (default 5)
        """
        if not PRODUCTS:
            return "No products available in the database."
        
        # Create searchable strings for each product
        searchable_products = []
        for product in PRODUCTS:
            searchable_text = f"{product['title']} {product['description']} {' '.join(product.get('tags', []))} {product['category']} {product.get('brand', '')}".lower()
            searchable_products.append((searchable_text, product))
        
        query_lower = query.lower()
        
        # Use difflib to find closest matches
        matches = []
        for searchable_text, product in searchable_products:
            if query_lower in searchable_text:
                # Calculate similarity score
                similarity = difflib.SequenceMatcher(None, query_lower, searchable_text).ratio()
                matches.append((similarity, product))
        
        # Sort by similarity and get top matches
        matches.sort(key=lambda x: x[0], reverse=True)
        top_products = [product for _, product in matches[:limit]]
        
        if not top_products:
            return f"No products found matching '{query}'. Try different keywords."
        
        result = f"Found {len(top_products)} products matching '{query}':\n\n"
        for i, product in enumerate(top_products, 1):
            discount_text = f" ({product['discountPercentage']:.1f}% off!)" if product['discountPercentage'] > 0 else ""
            result += f"{i}. {product['title']} - ${product['price']:.2f}{discount_text}\n"
            result += f"   Category: {product['category']} | Rating: {product['rating']:.1f}/5 | Stock: {product['stock']}\n"
            result += f"   {product['description'][:100]}...\n\n"
        
        return result

    @function_tool
    async def get_top_discounts(self, context: RunContext[UserData], limit: int = 10) -> str:
        """Get products with the highest discount percentages.

        Args:
            limit: Maximum number of products to return (default 10)
        """
        if not PRODUCTS:
            return "No products available in the database."
        
        # Sort products by discount percentage
        discounted_products = [p for p in PRODUCTS if p['discountPercentage'] > 0]
        discounted_products.sort(key=lambda x: x['discountPercentage'], reverse=True)
        
        top_products = discounted_products[:limit]
        
        if not top_products:
            return "No discounted products available at the moment."
        
        result = f"🔥 TOP {len(top_products)} DISCOUNTS:\n\n"
        for i, product in enumerate(top_products, 1):
            original_price = product['price'] / (1 - product['discountPercentage'] / 100)
            savings = original_price - product['price']
            result += f"{i}. {product['title']}\n"
            result += f"   💰 ${product['price']:.2f} (was ${original_price:.2f}) - SAVE ${savings:.2f}!\n"
            result += f"   🔥 {product['discountPercentage']:.1f}% OFF | {product['category']} | Rating: {product['rating']:.1f}/5\n"
            result += f"   📦 Stock: {product['stock']}\n\n"
        
        return result

    @function_tool
    async def get_products_by_category(self, context: RunContext[UserData], category: str, limit: int = 8) -> str:
        """Get products from a specific category.

        Args:
            category: Product category (e.g., 'beauty', 'electronics', 'clothing')
            limit: Maximum number of products to return (default 8)
        """
        if not PRODUCTS:
            return "No products available in the database."
        
        category_products = [p for p in PRODUCTS if p['category'].lower() == category.lower()]
        
        if not category_products:
            available_categories = sorted(set(p['category'] for p in PRODUCTS))
            return f"No products found in '{category}' category. Available categories: {', '.join(available_categories)}"
        
        # Sort by rating and discount
        category_products.sort(key=lambda x: (x['rating'], x['discountPercentage']), reverse=True)
        top_products = category_products[:limit]
        
        result = f"Top {len(top_products)} products in {category.title()}:\n\n"
        for i, product in enumerate(top_products, 1):
            discount_text = f" ({product['discountPercentage']:.1f}% off!)" if product['discountPercentage'] > 0 else ""
            result += f"{i}. {product['title']} - ${product['price']:.2f}{discount_text}\n"
            result += f"   Brand: {product.get('brand', 'N/A')} | Rating: {product['rating']:.1f}/5 | Stock: {product['stock']}\n"
            result += f"   {product['description'][:80]}...\n\n"
        
        return result

    @function_tool
    async def get_products_in_price_range(self, context: RunContext[UserData], min_price: float, max_price: float, limit: int = 8) -> str:
        """Get products within a specific price range.

        Args:
            min_price: Minimum price
            max_price: Maximum price
            limit: Maximum number of products to return (default 8)
        """
        if not PRODUCTS:
            return "No products available in the database."
        
        filtered_products = [p for p in PRODUCTS if min_price <= p['price'] <= max_price]
        
        if not filtered_products:
            return f"No products found in the ${min_price:.2f} - ${max_price:.2f} price range."
        
        # Sort by rating and discount
        filtered_products.sort(key=lambda x: (x['rating'], x['discountPercentage']), reverse=True)
        top_products = filtered_products[:limit]
        
        result = f"Top {len(top_products)} products in ${min_price:.2f} - ${max_price:.2f} range:\n\n"
        for i, product in enumerate(top_products, 1):
            discount_text = f" ({product['discountPercentage']:.1f}% off!)" if product['discountPercentage'] > 0 else ""
            result += f"{i}. {product['title']} - ${product['price']:.2f}{discount_text}\n"
            result += f"   Category: {product['category']} | Rating: {product['rating']:.1f}/5\n"
            result += f"   {product['description'][:80]}...\n\n"
        
        return result

    @function_tool
    async def create_product_card(self, context: RunContext[UserData], product_id: int):
        """Create and display a product card for a specific product.

        Args:
            product_id: The ID of the product to display
        """
        userdata = context.userdata
        
        # Find the product
        product = next((p for p in PRODUCTS if p['id'] == product_id), None)
        if not product:
            return f"Product with ID {product_id} not found."
        
        card = userdata.add_product_card(product)
        
        # Get the room from the userdata
        if not userdata.ctx or not userdata.ctx.room:
            return f"Created a product card, but couldn't access the room to send it."
        
        room = userdata.ctx.room
        
        # Get the first participant in the room (should be the client)
        participants = room.remote_participants
        if not participants:
            return f"Created a product card, but no participants found to send it to."
        
        participant = next(iter(participants.values()), None)
        if not participant:
            return f"Created a product card, but couldn't get the first participant."
        
        # Calculate discounted price if applicable
        discounted_price = product['price']
        original_price = None
        if product['discountPercentage'] > 0:
            original_price = product['price'] / (1 - product['discountPercentage'] / 100)
        
        payload = {
            "action": "show",
            "id": card.id,
            "product_id": product['id'],
            "title": product['title'],
            "description": product['description'],
            "price": discounted_price,
            "original_price": original_price,
            "discount_percentage": product['discountPercentage'],
            "category": product['category'],
            "rating": product['rating'],
            "stock": product['stock'],
            "brand": product.get('brand', ''),
            "image": product.get('thumbnail', ''),
            "tags": product.get('tags', [])
        }
        
        json_payload = json.dumps(payload)
        logger.info(f"Sending product card payload: {json_payload}")
        await room.local_participant.perform_rpc(
            destination_identity=participant.identity,
            method="client.productcard",
            payload=json_payload
        )
        
        discount_text = f" with {product['discountPercentage']:.1f}% off" if product['discountPercentage'] > 0 else ""
        return f"I've created a product card for {product['title']} at ${product['price']:.2f}{discount_text}!"
    
    @function_tool
    async def create_product_selection_quiz(self, context: RunContext[UserData], category: Optional[str] = None, count: int = 8):
        """Create a product selection quiz (like Tinder for products) where users can like/dislike products to get recommendations and earn discounts.
        
        Args:
            category: Optional category to focus on (e.g., 'beauty', 'electronics')
            count: Number of products to include in the quiz (default 8)
        """
        userdata = context.userdata
        
        # Filter products by category if specified
        available_products = PRODUCTS
        if category:
            available_products = [p for p in PRODUCTS if p['category'].lower() == category.lower()]
        
        if len(available_products) < count:
            return f"Not enough products available. Found {len(available_products)} products."
        
        # Select diverse products (different categories, price ranges, ratings)
        selected_products = random.sample(available_products, min(count, len(available_products)))
        
        quiz = userdata.add_product_quiz(selected_products)
        
        # Get the room from the userdata
        if not userdata.ctx or not userdata.ctx.room:
            return f"Created a product quiz, but couldn't access the room to send it."
        
        room = userdata.ctx.room
        
        # Get the first participant in the room
        participants = room.remote_participants
        if not participants:
            return f"Created a product quiz, but no participants found to send it to."
        
        participant = next(iter(participants.values()), None)
        if not participant:
            return f"Created a product quiz, but couldn't get the first participant."
        
        # Format products for client
        client_products = []
        for card in quiz.products:
            # Find the original product data
            product = next((p for p in PRODUCTS if p['id'] == card.product_id), None)
            if product:
                client_products.append({
                    "id": card.id,
                    "product_id": card.product_id,
                    "title": card.title,
                    "description": card.description,
                    "price": card.price,
                    "image": card.image,
                    "category": card.category,
                    "rating": product['rating'],
                    "discount_percentage": product['discountPercentage'],
                    "brand": product.get('brand', '')
            })
        
        payload = {
            "action": "show",
            "id": quiz.id,
            "products": client_products,
            "discount_percentage": quiz.discount_percentage,
            "instructions": "Swipe right (like) on products you're interested in! Like at least 3 products to unlock a 5% discount."
        }
        
        json_payload = json.dumps(payload)
        logger.info(f"Sending product quiz payload: {json_payload}")
        await room.local_participant.perform_rpc(
            destination_identity=participant.identity,
            method="client.productquiz",
            payload=json_payload
        )
        
        category_text = f" from {category}" if category else ""
        return f"I've created a fun product selection quiz with {count} products{category_text}! Swipe through them and like the ones you're interested in. If you like at least 3, you'll get a 5% discount!"

    async def on_enter(self):
        await asyncio.sleep(5)
        self.session.generate_reply()

async def entrypoint(ctx: JobContext):
    agent = PersonalShopperAgent()
    await ctx.connect()

    # Create a single AgentSession with userdata
    userdata = UserData(ctx=ctx)
    session = AgentSession[UserData](
        userdata=userdata, 
        turn_detection=EnglishModel()
    )

    # Create the avatar session
    avatar = tavus.AvatarSession(
        replica_id="r4c41453d2",
        persona_id="p2fbd605"
    )

    # Register RPC method for handling product card interactions
    async def handle_product_card_action(rpc_data):
        try:
            logger.info(f"Received product card action payload: {rpc_data}")
            
            payload_str = rpc_data.payload
            logger.info(f"Extracted payload string: {payload_str}")
            
            payload_data = json.loads(payload_str)
            logger.info(f"Parsed payload data: {payload_data}")
            
            action = payload_data.get("action")
            card_id = payload_data.get("id")
            
            if action == "view_details" and card_id:
                card = userdata.get_product_card(card_id)
                if card:
                    session.say(f"Let me tell you more about {card.title}. {card.description} It's priced at ${card.price:.2f} and has a {card.rating:.1f} star rating.")
                else:
                    logger.error(f"Product card with ID {card_id} not found")
                
            return None
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error for product card payload '{rpc_data.payload}': {e}")
            return f"error: {str(e)}"
        except Exception as e:
            logger.error(f"Error handling product card action: {e}")
            return f"error: {str(e)}"
    
    # Register RPC method for handling product quiz submissions
    async def handle_product_quiz_submission(rpc_data):
        try:
            logger.info(f"Received product quiz submission payload: {rpc_data}")
            
            payload_str = rpc_data.payload
            logger.info(f"Extracted quiz submission string: {payload_str}")
            
            payload_data = json.loads(payload_str)
            logger.info(f"Parsed quiz submission data: {payload_data}")
            
            quiz_id = payload_data.get("id")
            selections = payload_data.get("selections", {})
            
            if not quiz_id:
                logger.error("No quiz ID found in payload")
                return "error: No quiz ID found in payload"
                
            # Process the product selections
            liked_products = userdata.process_product_selections(quiz_id, selections)
            
            if not liked_products:
                session.say("Thanks for trying the product quiz! I didn't see any products you liked, but that's okay. Let me know what you're looking for and I'll help you find something perfect!")
                return "success"
            
            # Count liked products and determine if they get discount
            liked_count = len(liked_products)
            
            if liked_count >= 3:
                # They get the discount!
                response = f"Fantastic! You liked {liked_count} products, which means you've unlocked a 5% discount on your next purchase! "
                response += "Here's what caught your eye: "
                
                product_names = [p['title'] for p in liked_products[:3]]
                response += ", ".join(product_names)
                
                if liked_count > 3:
                    response += f" and {liked_count - 3} more! "
                
                response += "I can see you have great taste! Would you like me to show you more products similar to these?"
                
            else:
                response = f"Thanks for the feedback! You liked {liked_count} products. "
                response += "You need to like at least 3 products to unlock the 5% discount, but I can still help you find more options. "
                response += "What specifically interests you about the products you selected?"
            
            # Have the agent say the results
            session.say(response)
            
            return "success"
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error for quiz submission payload '{rpc_data.payload}': {e}")
            return f"error: {str(e)}"
        except Exception as e:
            logger.error(f"Error handling quiz submission: {e}")
            return f"error: {str(e)}"
    
    # Register RPC methods
    logger.info("Registering RPC methods")
    ctx.room.local_participant.register_rpc_method(
        "agent.productCardAction",
        handle_product_card_action
    )
    
    ctx.room.local_participant.register_rpc_method(
        "agent.submitProductQuiz",
        handle_product_quiz_submission
    )

    # Start the avatar with the same session that has userdata
    await avatar.start(session, room=ctx.room)

    # Start the agent session with the same session object
    await session.start(
        room=ctx.room,
        room_output_options=RoomOutputOptions(
            audio_enabled=True,  # Enable audio since we want the avatar to speak
        ),
        agent=agent
    )

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint
        )
    )
