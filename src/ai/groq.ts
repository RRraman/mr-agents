'use server';

/**
 * @fileOverview Groq LLM integration utility with robust JSON parsing and Realistic Demo Mode fallback.
 */

export async function callLLM(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  
  // Demo Mode Fallback if API Key is missing or placeholder
  if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey === '') {
    console.warn('GROQ_API_KEY is not set. Returning realistic demo simulation data.');
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      overallAnalysis: {
        overallScore: 42,
        wouldUsePercent: 50,
        wouldPayPercent: 20,
        topAudience: "Niche productivity hackers and solo developers",
        summary: "DEMO MODE: The product concept has a lukewarm reception. While 50% see the technical value, high price sensitivity and the existence of 'good enough' free alternatives are major barriers. Most agents are skeptical of adding another subscription to their stack."
      },
      agents: [
        {
          name: "Arjun Mehta",
          role: "Senior Full-Stack Developer",
          personality: "Pragmatic, efficiency-focused, skeptical.",
          goal: "Automate repetitive tasks.",
          problem: "Too many low-value manual steps.",
          score: 82,
          wouldUse: true,
          wouldPay: true,
          priceWilling: "₹800",
          timeToAdopt: "Immediate",
          reason: "Solves a real pain point I have right now.",
          feedback: "Good tool, but simplify the onboarding. If it takes more than 5 minutes to set up, I'm out."
        },
        {
          name: "Sarah Jenkins",
          role: "Freelance Designer",
          personality: "Creative, budget-conscious.",
          goal: "Manage client projects faster.",
          problem: "Invoicing is a nightmare.",
          score: 55,
          wouldUse: true,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "Next week",
          reason: "Useful, but I'd only use a free tier. I can't justify ₹1000/month for this.",
          feedback: "Add a free tier for individuals. Your pricing is built for teams, not freelancers."
        },
        {
          name: "David Okafor",
          role: "Product Manager",
          personality: "Analytical, ROI-focused.",
          goal: "Improve team velocity.",
          problem: "Engineering bottleneck.",
          score: 65,
          wouldUse: true,
          wouldPay: true,
          priceWilling: "₹1000",
          timeToAdopt: "1 month",
          reason: "Potential ROI is high if adoption is easy.",
          feedback: "Show me a comparison with Jira and Linear. Why should I switch?"
        },
        {
          name: "Elena Rossi",
          role: "Student / Aspiring Dev",
          personality: "Curious, no budget.",
          goal: "Build a portfolio.",
          problem: "SaaS costs are too high.",
          score: 40,
          wouldUse: true,
          wouldPay: false,
          priceWilling: "₹100",
          timeToAdopt: "N/A",
          reason: "Too expensive for a student budget.",
          feedback: "I'll wait for an open-source clone."
        },
        {
          name: "Marcus Thorne",
          role: "CTO",
          personality: "Security-focused, busy.",
          goal: "Compliance and scaling.",
          problem: "Security vulnerabilities in 3rd party tools.",
          score: 15,
          wouldUse: false,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "Never",
          reason: "Doesn't meet enterprise security standards.",
          feedback: "Without SOC2, my team isn't even allowed to look at your landing page."
        },
        {
          name: "Aisha Khan",
          role: "Growth Marketer",
          personality: "Data-driven, impatient.",
          goal: "Scale user acquisition.",
          problem: "High churn rate.",
          score: 30,
          wouldUse: false,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "N/A",
          reason: "Not a priority right now. We have bigger fires to put out.",
          feedback: "This feels like a 'nice to have', not a 'must have'."
        },
        {
          name: "Liam O'Connor",
          role: "DevOps Engineer",
          personality: "Automation freak, CLI lover.",
          goal: "Zero-touch infra.",
          problem: "Documentation is usually trash.",
          score: 75,
          wouldUse: true,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "Tomorrow",
          reason: "I'll try it if there is a robust API, but I won't pay for UI features.",
          feedback: "Focus on your API and documentation. That's your product."
        },
        {
          name: "Sophie Dubois",
          role: "E-commerce Owner",
          personality: "Traditional, tech-averse.",
          goal: "Increase sales.",
          problem: "Low conversion rates.",
          score: 10,
          wouldUse: false,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "Never",
          reason: "Too technical. I don't understand what this does.",
          feedback: "Explain it in plain English. I'm not a coder."
        },
        {
          name: "Kevin Chen",
          role: "Startup Founder",
          personality: "Visionary, fast-moving.",
          goal: "Get to PMF.",
          problem: "Moving too slow.",
          score: 45,
          wouldUse: false,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "N/A",
          reason: "Already using a similar tool that integrates with my stack.",
          feedback: "Your competition is already ahead. You need a unique angle."
        },
        {
          name: "Priya Sharma",
          role: "HR Manager",
          personality: "People-first, process-oriented.",
          goal: "Improve employee retention.",
          problem: "Burnout in the dev team.",
          score: 5,
          wouldUse: false,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "Never",
          reason: "Completely irrelevant to my department.",
          feedback: "Target developers, not general business managers."
        }
      ]
    };
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are MR.Agents simulation engine. Return ONLY valid JSON. No markdown. No explanation. No text before or after JSON. Always return an object with overallAnalysis (containing overallScore, wouldUsePercent, wouldPayPercent, topAudience, summary) and agents (array of 10 items).',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("JSON parse failed, attempting extraction:", text);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        console.error("Fallback extraction failed:", innerError);
      }
    }
    throw new Error("Invalid AI JSON response");
  }
}
