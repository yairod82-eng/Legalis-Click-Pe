window.addEventListener('load',function(){
  const box=document.getElementById('juez3d');
  if(!box||!window.THREE)return;
  const W=()=>box.clientWidth||300, H=()=>box.clientHeight||340;

  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(32,W()/H(),0.1,100);
  cam.position.set(0,0.9,8.2);
  const ren=new THREE.WebGLRenderer({antialias:true,alpha:true});
  ren.setPixelRatio(Math.min(devicePixelRatio,2));
  ren.setSize(W(),H());
  box.appendChild(ren.domElement);

  scene.add(new THREE.AmbientLight(0xffffff,0.65));
  const key=new THREE.DirectionalLight(0xcfe6ff,1.0); key.position.set(3,5,5); scene.add(key);
  const rim=new THREE.DirectionalLight(0x3b82f6,1.2); rim.position.set(-4,2,-3); scene.add(rim);

  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.65,metalness:.05},o||{}));
  const skin=M(0xf0c4a0), black=M(0x0a0e18,{roughness:.8}), white=M(0xf4f6fa,{roughness:.9}),
        wood=M(0x6b3f1d,{roughness:.55}), gold=M(0xd4af37,{metalness:.7,roughness:.3});

  const judge=new THREE.Group(); scene.add(judge);

  const robe=new THREE.Mesh(new THREE.CylinderGeometry(.75,1.35,2.3,40),black); robe.position.y=-.45; judge.add(robe);
  const sh=new THREE.Mesh(new THREE.SphereGeometry(.9,40,20),black); sh.scale.set(1.2,.55,.75); sh.position.y=.68; judge.add(sh);

  [-.14,.14].forEach(x=>{
    const j=new THREE.Mesh(new THREE.BoxGeometry(.22,.7,.06),white);
    j.position.set(x,.5,.62); j.rotation.z=x>0?-.08:.08; judge.add(j);
  });

  const head=new THREE.Group(); head.position.y=1.45; judge.add(head);
  head.add(new THREE.Mesh(new THREE.SphereGeometry(.42,40,24),skin));
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.07,16,12),skin); nose.position.set(0,-.03,.41); head.add(nose);
  [-.15,.15].forEach(x=>{
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.04,12,12),M(0x111111)); eye.position.set(x,.08,.37); head.add(eye);
    const brow=new THREE.Mesh(new THREE.BoxGeometry(.14,.025,.03),M(0x444444)); brow.position.set(x,.17,.38); head.add(brow);
  });
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(.16,.025,.03),M(0x8a4b3a)); mouth.position.set(0,-.2,.38); head.add(mouth);

  const wig=new THREE.Mesh(new THREE.SphereGeometry(.5,40,24),white); wig.scale.set(1.05,.95,1); wig.position.set(0,.1,-.08); head.add(wig);
  [-1,1].forEach(s=>{ for(let i=0;i<3;i++){
    const c=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),white); c.position.set(s*.46,-.12-i*.17,0); head.add(c);
  }});

  const bench=new THREE.Mesh(new THREE.BoxGeometry(3.6,.9,1.1),wood); bench.position.set(0,-1.6,.9); judge.add(bench);
  const block=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,.12,24),wood); block.position.set(-.9,-1.09,1.1); judge.add(block);

  const armL=new THREE.Mesh(new THREE.CylinderGeometry(.17,.2,1.1,20),black);
  armL.position.set(-1.0,.15,.35); armL.rotation.set(.7,0,.25); judge.add(armL);

  const armR=new THREE.Group(); armR.position.set(1.0,.68,.1); judge.add(armR);
  const arm=new THREE.Mesh(new THREE.CylinderGeometry(.17,.2,1.1,20),black); arm.position.y=-.55; armR.add(arm);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.17,20,16),skin); hand.position.y=-1.12; armR.add(hand);
  const gavel=new THREE.Group(); gavel.position.y=-1.12; gavel.rotation.x=1.2; armR.add(gavel);
  const handle=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.7,12),wood); handle.position.y=.3; gavel.add(handle);
  const gh=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.4,20),wood); gh.rotation.z=Math.PI/2; gh.position.y=.66; gavel.add(gh);
  [-.2,.2].forEach(x=>{const r=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.03,20),gold); r.rotation.z=Math.PI/2; r.position.set(x,.66,0); gavel.add(r);});

  let mx=0,my=0;
  const move=e=>{
    const t=e.touches?e.touches[0]:e, b=box.getBoundingClientRect();
    mx=((t.clientX-b.left)/b.width-.5)*2; my=((t.clientY-b.top)/b.height-.5)*2;
  };
  addEventListener('mousemove',move); addEventListener('touchmove',move,{passive:true});

  const clock=new THREE.Clock();
  (function loop(){
    requestAnimationFrame(loop);
    const t=clock.getElapsedTime();
    judge.position.y=Math.sin(t*1.6)*.03;
    head.rotation.y+=(mx*.6-head.rotation.y)*.06;
    head.rotation.x+=(my*.25-head.rotation.x)*.06;
    judge.rotation.y=Math.sin(t*.5)*.12;
    const k=(t%4)/4, strike=k<.12?Math.sin(k/.12*Math.PI):0;
    armR.rotation.x=-.9+strike*.8; armR.rotation.z=-.35;
    ren.render(scene,cam);
  })();

  addEventListener('resize',()=>{ren.setSize(W(),H());cam.aspect=W()/H();cam.updateProjectionMatrix();});
});
