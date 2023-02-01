import * as PushAPI from "@pushprotocol/restapi";
import ethers from "ethers";
import axios from 'axios';

const PK = 'PRIVATE_KEY_CHANNEL';
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

var mess,pro0,vot0,fol0;
const space = "bgldao.eth"; // your space
const urlql = "https://hub.snapshot.org/graphql?";
const urlp = `https://snapshot.org/#/${space}/proposal/`;

main()
async function main() {
mess = [];
await prom()
await votm()
await folm()
//console.log(mess);
mess.sort(function(a,b){ return a.e - b.e });
console.log(mess);
for (var el of mess) { await sendMes(el) }
setTimeout(main, 30000)
}

//PROPOSALS
async function prom() {
  const resp = await  axios.post(urlql,{
      "query": `query Proposals {\n  proposals (\n    first: 5,\n    skip: 0,\n    where: {\n      space: \"${space}\"\n    },\n    orderBy: \"created\",\n    orderDirection: desc\n  ) {\n    id\n    title\n    body\n    choices\n    start\n    end\n    snapshot\n    state\n    author\n    space {\n      id\n      name\n    }\n link\n   created\n }\n}`
      }).then(function(res){ return res.data.data.proposals;}).catch(function(e){console.log(e);})
try {
  if (!pro0) { pro0 = resp; }
    for (var i=0; i < resp.length; i++) {
      var j = resp[i];
	    var str = JSON.stringify(pro0).indexOf(j.id)
      if (str == -1) {
        var tit,bo,url,epo;
        tit = "New proposal";
        bo = `${j.title}\nStart: ${new Date(j.start * 1e3).toISOString().slice(0,-5)} UTC\nEnd: ${new Date(j.end * 1e3).toISOString().slice(0,-5)} UTC`;
        url = urlp + j.id;
		    epo = j.created;
		    mess.push({t:tit,b:bo,u:url,e:epo});
	    } else {break}
	}
  pro0 = resp;
} catch(e) {console.log(e)}
}

//VOTES
async function votm() {
  const resp = await  axios.post(urlql,{
      "query": `query Votes {\n  votes (\n    first: 5\n    skip: 0\n    where: {\n      space: \"${space}\"\n    }\n    orderBy: \"created\",\n    orderDirection: desc\n  ) {\n    id\n    voter\n    vp\n    created\n    proposal {\n      id\n    }\n    choice\n    space {\n      id\n    }\n  }\n}`
      }).then(function(res){ return res.data.data.votes;}).catch(function(e){console.log(e);})
try {
  if (!vot0) { vot0 = resp; }
    for (var i=0; i < resp.length; i++) {
      var j = resp[i];
      var str = JSON.stringify(vot0).indexOf(j.id)
      if (str == -1) {
        var tit,bo,url,epo;
        tit = "New vote";
		    const pr = await fetchPro(j.proposal.id);
		    bo = `${pr.proposal.title}\nVoter: ${j.voter.substr(0,7) + '...' + j.voter.substr(-5)}\nPower: ${Math.round(j.vp*100)/100}`;
        url = urlp + j.proposal.id;
        epo = j.created;
        mess.push({t:tit,b:bo,u:url,e:epo});
      } else {break}
    }
  vot0 = resp;
} catch(e) {console.log(e)}
} 

//FOLLOW
async function folm() {
  const resp = await  axios.post(urlql,{
  "query": `query {\n  follows(\n    first: 10,\n    where: {\n      space: \"${space}\"\n    }\n  ) {\n    follower\n    space {\n      id\n    }\n    created\n  }\n}`
  }).then(function(res){ return res.data.data.follows;}).catch(function(e){console.log(e);})
try {
  if (!fol0) { fol0 = resp; }
    for (var i=0; i < resp.length; i++) {
      var j = resp[i];
      var str = JSON.stringify(fol0).indexOf(j.follower)
      if (str == -1) {
        var tit,bo,url,epo;
        tit = "New follower";
        bo = j.follower;
        url = `https://snapshot.org/#/profile/${j.follower}`;
        epo = j.created;
        mess.push({t:tit,b:bo,u:url,e:epo});
      } else {break}
    }
  fol0 = resp;
} catch(e) {console.log(e)}
}

async function fetchPro(id) {
	return await axios.post(urlql,{
        "query": `query  {\n  proposal(id:\"${id}\") {\n    id\n    title\n    body\n    choices\n    start\n    end\n    snapshot\n    state\n    author\n    space {\n      id\n      name\n    }\n  }\n}`
	      }).then(function(res){return res.data.data;}).catch(function(e){})
}

// NOTIFY
async function sendMes(el) {
const apiResponse = await PushAPI.payloads.sendNotification({
    signer,
    type: 1, // broadcast
    identityType: 2, // direct payload
    notification: {
      title: el.t,
      body: el.b
    },
    payload: {
      title: el.t,
      body: el.b,
      cta: el.u,
      img: ''
    },
    channel: 'eip155:1:0x9bBb9c87E1B203c8B62Bd0c91FfDAD32bc3b16bD', // your channel address
    env: 'prod' // staging, prod, dev
  });
}
  
