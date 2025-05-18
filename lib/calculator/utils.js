import { analyzeWithGemini } from '../gemini';

export async function analyze_image(imageBuffer, dict_of_vars) {
  const dict_of_vars_str = JSON.stringify(dict_of_vars);

  const prompt = `
  You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them.
  Note: Use the PEMDAS rule for solving mathematical expressions.
  
  Return the response in VALID JSON format with DOUBLE QUOTES for all property names and string values.
  Example of valid format: 
  [{"expr": "2+3", "result": 5, "assign": false}]
  
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

    // Attempt to clean the response more thoroughly
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
    let formattedExpr = answer.expr;
    // If it's an assignment, format as "variable = value"
    if (answer.assign) {
      formattedExpr = `${answer.expr} = ${answer.result}`;
    }
    // If it's an equation without equals, add it
    else if (!answer.expr.includes('=')) {
      formattedExpr = `${answer.expr} = ${answer.result}`;
    }
    // If it's an equation with equals, ensure the result is correct
    else {
      const parts = answer.expr.split('=');
      formattedExpr = `${parts[0].trim()} = ${answer.result}`;
    }
    
    return {
      expr: formattedExpr,
      result: answer.result,
      assign: answer.assign || false,
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
