export async function POST(request: Request) {
  try {
    const { newValue } = await request.json();
    console.log("🔒 Chiller value:", newValue);
    
    // Disable cert validation for this request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    const res = await fetch(`http://192.168.151.100/api/set/op?op=MW&index=1&val=69`, {
      method: "POST",
      headers: { "Authorization": "Bearer aa554fa5a1d8135fc6d139d865a4f66f55916ddb04742bcec5622f17a292b50d54327980e36a38e1" }
    });
    
    const text = await res.text();
    console.log("✅ Status:", res.status, "Response:", text);
    return Response.json({ status: res.status, body: text });
  } catch (e) {
    console.error("❌ Error:", e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}