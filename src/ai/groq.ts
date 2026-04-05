
'use server';

/**
 * @fileOverview Groq LLM integration utility with robust JSON parsing and Demo Mode fallback.
 */

export async function callLLM(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  
  // Demo Mode Fallback if API Key is missing or placeholder
  if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey === '') {
    console.warn('GROQ_API_KEY is not set or is a placeholder. Returning demo simulation data.');
    
    // Simulate a brief delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return high-quality mock data structure that matches the expected schema
    return {
      overallAnalysis: {
        overallScore: 78,
        wouldUsePercent: 85,
        wouldPayPercent: 60,
        topAudience: "Early-stage SaaS founders and solo developers",
        summary: "DEMO MODE: The product concept shows strong initial appeal among developers, particularly for its automation capabilities. Pricing at ₹1000 is seen as fair by 60% of the sample, though budget-conscious students might hesitate."
      },
      agents: [
        {
          name: "Arjun Mehta",
          role: "Senior Full-Stack Developer",
          personality: "Pragmatic, efficiency-focused, slightly skeptical of over-hyped tools.",
          goal: "Automate repetitive infrastructure tasks to focus on core logic.",
          problem: "Spends 4+ hours a week on manual deployment configurations.",
          score: 85,
          wouldUse: true,
          wouldPay: true,
          priceWilling: "₹800 - ₹1200",
          timeToAdopt: "Immediate (1-3 days)",
          reason: "Solves a specific bottleneck I encounter daily.",
          feedback: "Focus on making the integration with existing CI/CD pipelines as seamless as possible. That is where you win me over."
        },
        {
          name: "Priya Sharma",
          role: "UX Researcher",
          personality: "Analytical, user-centric, values clean interfaces and clear documentation.",
          goal: "Streamline qualitative data analysis pipelines.",
          problem: "Drowning in raw interview transcripts without a clear synthesis tool.",
          score: 45,
          wouldUse: false,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "N/A",
          reason: "Doesn't quite fit my specific workflow for user research synthesis.",
          feedback: "While the tech is cool, it feels more like a dev tool than something for design or research. Be clear about your niche."
        },
        {
          name: "Kevin Chen",
          role: "Startup Founder (Seed Stage)",
          personality: "Visionary, fast-moving, high risk tolerance, budget-sensitive.",
          goal: "Ship MVP in 2 weeks with minimal burn.",
          problem: "Limited engineering resources to build internal dev-ops tooling.",
          score: 92,
          wouldUse: true,
          wouldPay: true,
          priceWilling: "₹1000",
          timeToAdopt: "Instant",
          reason: "Saves me from hiring a part-time dev-ops person right now.",
          feedback: "If you can offer a 'pro' tier with more support, I'd pay even more once we scale."
        },
        {
          name: "Sarah Jenkins",
          role: "Freelance Content Creator",
          personality: "Creative, tech-averse, relies on simple 'no-code' solutions.",
          goal: "Build a community without learning to code.",
          problem: "Managing memberships across 3 different platforms is a nightmare.",
          score: 30,
          wouldUse: false,
          wouldPay: false,
          priceWilling: "₹200",
          timeToAdopt: "N/A",
          reason: "Too technical. I don't understand the API terminology.",
          feedback: "Make a version with a simpler dashboard for people like me who just want a 'buy' button."
        },
        {
          name: "David Okafor",
          role: "Product Manager",
          personality: "Data-driven, concerned with scalability and ROI.",
          goal: "Reduce time-to-market for new feature experiments.",
          problem: "The engineering queue is 6 months long.",
          score: 75,
          wouldUse: true,
          wouldPay: true,
          priceWilling: "₹1500",
          timeToAdopt: "2-4 weeks",
          reason: "Allows product teams to move faster without constant engineering hand-holding.",
          feedback: "Show me a clear ROI calculator based on developer hours saved."
        },
        {
          name: "Elena Rossi",
          role: "CS Student",
          personality: "Eager to learn, extremely low budget, loves open source.",
          goal: "Build a portfolio project that stands out.",
          problem: "Can't afford paid SaaS subscriptions for small personal projects.",
          score: 60,
          wouldUse: true,
          wouldPay: false,
          priceWilling: "₹100",
          timeToAdopt: "Next project",
          reason: "Useful tool, but the ₹1000 price point is too high for a student.",
          feedback: "Consider a free student tier to build brand loyalty early."
        },
        {
          name: "Marcus Thorne",
          role: "Enterprise CTO",
          personality: "Security-obsessed, highly cautious, looks for SOC2 compliance.",
          goal: "Consolidate toolchain and improve security posture.",
          problem: "Shadow IT where developers use unapproved third-party tools.",
          score: 20,
          wouldUse: false,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "Never",
          reason: "No clear enterprise security documentation.",
          feedback: "You need to talk about data residency and security before a company of my size will even look at you."
        },
        {
          name: "Aisha Khan",
          role: "Growth Marketer",
          personality: "Experiment-driven, focused on conversion and attribution.",
          goal: "Automate A/B testing of landing pages.",
          problem: "Dependence on devs for simple tracking script changes.",
          score: 55,
          wouldUse: true,
          wouldPay: false,
          priceWilling: "₹500",
          timeToAdopt: "Next campaign",
          reason: "Interesting, but I'm not sure if it solves my specific marketing tech problems better than existing tools.",
          feedback: "Partner with marketing agencies to get broader adoption."
        },
        {
          name: "Liam O'Connor",
          role: "DevOps Engineer",
          personality: "Loves automation, hates 'black box' solutions, prefers CLI.",
          goal: "Zero-touch infrastructure.",
          problem: "Debugging complex, poorly documented cloud configs.",
          score: 88,
          wouldUse: true,
          wouldPay: true,
          priceWilling: "₹900",
          timeToAdopt: "Immediate",
          reason: "The clarity of documentation and focus on a single problem is refreshing.",
          feedback: "Keep it simple. Don't add too many features. Do one thing perfectly."
        },
        {
          name: "Sophie Dubois",
          role: "E-commerce Owner",
          personality: "Business-first, looks for direct impact on revenue.",
          goal: "Increase repeat purchase rate.",
          problem: "Generic email marketing isn't working anymore.",
          score: 15,
          wouldUse: false,
          wouldPay: false,
          priceWilling: "₹0",
          timeToAdopt: "N/A",
          reason: "This product is for software developers, not shop owners.",
          feedback: "Clearly state who this is NOT for on your homepage to save people time."
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
          content: 'You are MR.Agents simulation engine. Return JSON only.',
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
