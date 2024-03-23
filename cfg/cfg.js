const priElement = document.querySelector("input[name=pri]");
const secElement = document.querySelector("input[name=sec]");
document.querySelector("form").onsubmit = (e) => {
  let iceServerLst = [];
  iceServerLst.push(priElement.value);
  if (secElement.value) iceServerLst.push(secElement.value);
  localStorage.setItem("iceServerLst", iceServerLst.join("\n"));
  window.close();
  return false;
};
const iceServerLst = localStorage.getItem("iceServerLst");
if (iceServerLst)
  iceServerLst.split("\n").forEach((e, i) => {
    if (i === 0) priElement.value = e;
    if (i === 1) secElement.value = e;
  });
