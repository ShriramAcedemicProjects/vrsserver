const getClientIP = (req) => {
    let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // If multiple IPs are present (proxy case), take the first one
    if (ip.includes(",")) {
      ip = ip.split(",")[0];
    }
  
    // Remove IPv6 prefix "::ffff:" if present
    ip = ip.replace(/^::ffff:/, "");
  
    return ip;
  };
  
  module.exports = getClientIP;
  