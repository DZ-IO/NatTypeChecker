let msg = document.querySelector("#msg");
document.querySelectorAll("a").forEach((e) =>
  e.addEventListener("click", (e) => {
    window.open(
      e.target.href,
      e.target.target,
      `height=${e.target.offsetHeight * 3},width=${e.target.offsetWidth * 3},`
    );
  })
);
function parseCandidate(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf("a=candidate:") === 0) {
    parts = line.substring(12).split(" ");
  } else {
    parts = line.substring(10).split(" ");
  }

  var candidate = {
    foundation: parts[0],
    component: parts[1],
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7],
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case "raddr":
        candidate.relatedAddress = parts[i + 1];
        break;
      case "rport":
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case "tcptype":
        candidate.tcpType = parts[i + 1];
        break;
      default: // Unknown extensions are silently ignored.
        break;
    }
  }
  return candidate;
}

async function main() {
  let iceServerLst = localStorage.getItem("iceServerLst");
  if (!iceServerLst) {
    let res = await fetch("./servers.txt");
    iceServerLst = await res.text();
  }
  let iceServers = [];
  iceServerLst.split("\n").forEach((server) => {
    iceServers.push({ urls: `stun:${server}` });
  });
  console.log(iceServers);
  var candidates = {};
  var pc = new RTCPeerConnection({ iceServers: iceServers });
  pc.createDataChannel("foo");
  pc.onicecandidate = function (e) {
    if (e.candidate && e.candidate.candidate.indexOf("srflx") !== -1) {
      var cand = parseCandidate(e.candidate.candidate);
      if (!candidates[cand.relatedPort]) candidates[cand.relatedPort] = [];
      candidates[cand.relatedPort].push(cand.port);
    } else if (!e.candidate) {
      if (Object.keys(candidates).length === 1) {
        var ports = candidates[Object.keys(candidates)[0]];
        msg.innerText = `NAT Type: ${
          ports.length === 1 ? "Normal" : "Symmetric"
        }`;
      }
    }
  };
  let offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
}

main().then();
