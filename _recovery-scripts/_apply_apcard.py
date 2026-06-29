import os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
BASE = r"C:\xampp2\htdocs\autopart-backup\autoparts-source\app"
roots = ["admin","supplier","affiliate"]
pats = [
  "bg-white rounded-xl border border-[#f0f0f0]",
  "bg-white rounded-2xl border border-[#f0f0f0]",
]
changed=[]
for r in roots:
    for dp,_,files in os.walk(os.path.join(BASE,r)):
        for fn in files:
            if not fn.endswith(".tsx"): continue
            p=os.path.join(dp,fn)
            s=open(p,encoding="utf-8").read(); orig=s
            for pat in pats:
                s=s.replace(pat, "ap-card "+pat)
            # dedupe accidental double
            s=s.replace("ap-card ap-card ","ap-card ")
            if s!=orig:
                open(p,"w",encoding="utf-8").write(s)
                n=s.count("ap-card ")
                changed.append((p.replace(BASE+"\\",""), n))
print("Files changed:", len(changed))
for f,n in changed: print(f"  {n:>2} ap-card  {f}")
