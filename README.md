# ai-prompt-tool

# AI Tools React App

A React-based AI tools application featuring calorie tracking, translation, and PDF summarization. Built with Vite, React, and Tailwind CSS, leveraging Google Gemini API for generative language capabilities.

## Features

- Calorie Info tracker  
- Language Translation tool  
- PDF Summarizer  
- Light/Dark mode toggle  
- Responsive sidebar navigation with mobile hamburger menu  

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)  
- npm or yarn package manager  

### Installation

1. Clone the repository:

   git clone https://github.com/Adesomoju/ai-prompt-tool.git
   cd ai-prompt-tool

2. Install dependencies:

    npm install
    # or
    yarn install


3. Create a .env file in the project root with your API keys:

    - VITE_GEMINI_API_KEY=your_api_key_here
    - VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
    - VITE_GEMINI_MODEL=gemini-2.0-flash

Note: This .env file is not included in the repository for security reasons. 


### Running the app

    npm run dev
    # or
    yarn dev


### Building for Production

    npm run build
    # or
    yarn build
