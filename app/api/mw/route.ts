process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Disable TLS cert validation globally (use with caution!)
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { index, value } = await req.json();
  
  const url = `https://192.168.151.100/api/set/op?op=MW&index=${index}&val=${value}`;
  
  // SET
  const setRes = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer aa554fa5a1d8135fc6d139d865a4f66f55916ddb04742bcec5622f17a292b50d54327980e36a38e1`}
  });

  // READ back to verify
  const getUrl = `https://192.168.151.100/api/get/data?elm=MW${index}`;
  const getRes = await fetch(getUrl, {
    method: "GET",
    headers: { Authorization: `Bearer aa554fa5a1d8135fc6d139d865a4f66f55916ddb04742bcec5622f17a292b50d54327980e36a38e1` }
  });
  
  const data = await getRes.json();
  console.log(`Set MW${index} to ${value}, current value: ${data.result}`);
  
  return NextResponse.json({ 
    set: setRes.status,
    current_value: data.result 
  });
}