# MPad - AI MATH SOLVER 🤖


An intelligent web application that analyze, interpret, and solve handwritten mathematical equations. Key features include:

1.Image Processing

2.AI-Powered Computation

3.Interactive Digital Workspace

4.Smart Calculation Engine

---

## **Features**


* Automatically detect and solve mathematical expressions, equations, and graphical problems.
* Upload images containing math content or input problems by handwriting or typing.
* Choose between dark and light themes for comfortable viewing.
* Customizable color swatches for a tailored and personalized interface.

---

## **Technologies Used**

* **Frontend**: Next.js with Mantine UI.
* **Backend**: Next.js API routes with integration to the Gemini AI model.
* **AI**: Google Gemini 2.0 Flash for advanced generative content processing.
* **Styling**: Mantine UI and custom themes.
* **Utilities**: Custom utility functions for image analysis and JSON formatting.

---

## **Getting Started**

### Prerequisites

* Node.js (v16+)
* NPM or Yarn
* Google Generative AI API Key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ashwinkarnati/AI-Math-Calci.git
   cd math-expression-analyzer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:

   ```env
   GEMINI_API_KEY=your-google-api-key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

---

## **Usage**

1. Upload an image with mathematical content, or input equations, diagrams, graphs, or expressions using handwriting or text.
2. Optionally, define custom variables to use in your calculations.
3. Click Calculate to analyze the input and solve the expressions.
4. View results visually on the UI.



## **Customization**

### Themes

Modify the available themes in `constants.js`:

```javascript
export const THEMES = ['dark', 'light', 'grid', 'paper'];
```

### Swatches

Update color options in `constants.js`:

```javascript
export const SWATCHES = [
  { name: "black", color: "#000000" },
  { name: "red", color: "#FF0000" },
  ...
];
```

---

## **Contributing**

1. Fork the repository.
2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add your feature description"
   ```
4. Push to the branch:

   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---

## **License**

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## **Acknowledgments**

* [Mantine UI](https://mantine.dev/)
* [Google Gemini](https://cloud.google.com/generative-ai)
* [Next.js](https://nextjs.org/)
