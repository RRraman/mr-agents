# **App Name**: AI Market Simulator

## Core Features:

- Product Idea Input & Evaluation Type Selection: Allows users to input product concepts via text or link and choose from predefined market evaluation scenarios (Product Feedback, Market Fit, First Paying Users).
- AI Agent Generation Tool: Dynamically creates 10 unique AI agent profiles (name, role, personality, problem, goal, budget) based on the product input, designed to represent a niche-specific market segment.
- AI Product Evaluation Tool: Each generated AI agent critically evaluates the product, applying their persona and rules (would use/pay, useful, ignore) to generate detailed structured feedback, pricing willingness, and adoption timelines.
- Overall Market Analysis: Aggregates individual agent evaluations into an overall market score, adoption rates, payment percentages, identifies top audience segments, and provides a concise summary of the simulation results.
- Interactive Simulation Results Display: Presents the overall market analysis and individual AI agent cards with their specific scores, decisions, and feedback in a clean, user-friendly interface.
- Simulation History & Persistence: Saves each completed market simulation, including input details, AI agent profiles, and structured evaluation results, to Firestore for future review.

## Style Guidelines:

- Primary color: A deep, professional blue (#2272DB) to evoke intelligence, data, and reliability, fitting for an analytical tool. This hue will highlight key information and interactive elements.
- Background color: A very dark, subtle bluish-gray (#242D36). This dark scheme provides a sophisticated, focused environment for data display, ensuring high contrast and reducing eye strain.
- Accent color: A vibrant, energetic cyan (#45E1E9). This color is analogous to the primary and significantly brighter and more saturated, making it ideal for drawing attention to calls-to-action, active states, and important alerts.
- Headlines and prominent text will use 'Space Grotesk' (sans-serif) for a modern, tech-savvy aesthetic. Body text, detailed simulation results, and longer content will use 'Inter' (sans-serif) for excellent readability and a neutral, objective feel.
- Utilize sleek, modern outline icons to complement the app's analytical nature, maintaining a clean and intuitive user interface.
- A responsive, two-column layout for the main simulation interface. The left column will house input fields and controls, while the right displays real-time results, expanding into a full-width results view post-simulation. Information is organized into distinct, card-based components for clarity.
- Subtle loading animations during AI agent generation and product evaluation to indicate process activity, along with smooth transitions for result display and interactive elements.