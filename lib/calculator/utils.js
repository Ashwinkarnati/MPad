import { analyzeWithGemini } from '../gemini';

export async function analyze_image(imageBuffer, dict_of_vars) {
  const dict_of_vars_str = JSON.stringify(dict_of_vars);

  const prompt = `
  You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them.
  Note: Use the PEMDAS rule for solving mathematical expressions.
  
  Return the response in VALID JSON format with DOUBLE QUOTES for all property names and string values.
  The response must include an "expr" or "equation" field with the expression/equation, 
  a "result" field with the solution, and an optional "assign" field if it's a variable assignment.
  
  Example of valid format: 
  [{"expr": "2+3", "result": "5", "assign": false}]
  or
  [{"equation": "x^2 = 4", "result": "2", "assign": false}]
  
  Important formatting rules:
  1. For expressions, always return them in "expression = result" format
  2. For equations, maintain the original equation but append the solution
  3. For assignments, use the format "variable = value"
  
  Here are user-assigned variables: ${dict_of_vars_str}.
  Only return the JSON array, nothing else.
`;

  try {
    const responseText = await analyzeWithGemini(imageBuffer, prompt);
    console.log('Gemini response:', responseText);

    // Clean the response
    const cleanedResponse = responseText
      .replace(/```json|```/g, '') // Remove markdown code blocks
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/(\w+):/g, '"$1":') // Quote property names
      .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
      .replace(/}\s*{/g, '},{') // Fix unquoted adjacent objects
      .trim();

    console.log('Cleaned response:', cleanedResponse);

    try {
      const answers = JSON.parse(cleanedResponse);
      
      return answers.map(answer => {
        // Handle both 'expr' and 'equation' fields
        const expression = answer.expr || answer.equation;
        if (!expression) {
          throw new Error('Response missing required expression field');
        }

        let formattedExpr = expression;
        const isAssignment = answer.assign || false;
        
        // If it's an assignment, format as "variable = value"
        if (isAssignment) {
          formattedExpr = `${expression} = ${answer.result}`;
        }
        // If it's an equation/expression without equals, add it
        else if (!expression.includes('=')) {
          formattedExpr = `${expression} = ${answer.result}`;
        }
        // If it's an equation with equals, ensure the result is correct
        else {
          const parts = expression.split('=');
          formattedExpr = `${parts[0].trim()} = ${answer.result}`;
        }
        
        return {
          expr: formattedExpr,
          result: answer.result,
          assign: isAssignment,
        };
      });
    } catch (parseError) {
      console.error('Failed to parse cleaned response:', parseError);
      throw new Error(`Invalid response format from Gemini API: ${responseText}`);
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
}