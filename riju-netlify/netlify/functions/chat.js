exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { message, history } = JSON.parse(event.body || "{}");
  if (!message) return { statusCode: 400, body: JSON.stringify({ error: "message required" }) };

  const msgs = (history || []).map(h => ({
    role: h.role === "ai" ? "assistant" : "user",
    content: h.text
  }));
  msgs.push({ role: "user", content: message });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: "তুমি Riju AI — বাংলাদেশের একটি শক্তিশালী AI সহকারী। ব্যবহারকারী যে ভাষায় কথা বলে সেই ভাষায় উত্তর দাও। সহজ, বন্ধুত্বপূর্ণ এবং তথ্যপূর্ণ উত্তর দাও।",
      messages: msgs
    })
  });

  const data = await res.json();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reply: data.content?.[0]?.text || "উত্তর পাওয়া যায়নি।" })
  };
};
