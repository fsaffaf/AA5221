---
# This file is processed by Jekyll (Sass). It must include front matter.
---

/* assets/css/style.scss - subtle forward-travel tiny-dot starfield */
:root{
  --bg:#03040a;
  --nebula-1: rgba(40,30,60,0.10);
  --nebula-2: rgba(10,20,40,0.08);
  --accent:#9fe;
}

html,body{height:100%;margin:0;}
body{
  background:
    radial-gradient(1200px 600px at 10% 20%, var(--nebula-1), transparent 12%),
    radial-gradient(900px 500px at 85% 80%, var(--nebula-2), transparent 10%),
    var(--bg);
  color:#fff;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  overflow-x:hidden;
}

/* canvas behind content */
canvas#stars{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  z-index:0;
  pointer-events:none;
  display:block;
  mix-blend-mode:screen;
}

/* content above canvas */
.main-container{
  position:relative;
  z-index:2;
  padding:3rem 1.5rem;
  max-width:900px;
  margin:0 auto;
}

h1{margin:0 0 .5rem 0;color:#fff;font-weight:600;}
h2{margin-top:1.5rem;color:#dfefff;font-weight:500;}
a{color:var(--accent);text-decoration:none;}
a:hover{text-decoration:underline;}

/* subtle vignette */
body::after{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:1;
  background:radial-gradient(60% 60% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%);
}

/* small screens */
@media (max-width:600px){
  .main-container{padding:2rem 1rem;}
}
