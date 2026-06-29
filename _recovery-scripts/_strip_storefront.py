import os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
BASE = r"C:\xampp2\htdocs\autopart-backup\autoparts-source"
# storefront pages (app root + storefront dirs) + components
TARGET_DIRS = [os.path.join(BASE,"components")]
APP=os.path.join(BASE,"app")
store_dirs=["products","cart","checkout","search","catalog","flash-sale","suppliers","vin-lookup","tracking","support","help","about","login","register","policy","privacy","license","payment"]
TARGET_DIRS += [os.path.join(APP,d) for d in store_dirs]
# app root-level .tsx files (page.tsx, not-found.tsx) — handle separately
DECOR="📥📤📂🔥⭐🌍🔧🌐📦📌⬇⬆⚠🎁🏆💎🥇✨🔔📊📈📉💰🚀🛒🏠🚗🔑📝🎯⚡💡🎨🖼🔗📞✉📧🗑🏷🧾📋🛠🪪🚙♥💵🏬📡🌟💳🎉👍🙌📅🕐⏰🔍🛡"
def strip(path):
    s=open(path,encoding="utf-8").read(); o=s
    for c in DECOR: s=s.replace(c+" ","").replace(" "+c,"").replace(c,"")
    if s!=o: open(path,"w",encoding="utf-8").write(s); return True
    return False
changed=[]
for d in TARGET_DIRS:
    if not os.path.isdir(d): continue
    for dp,_,fs in os.walk(d):
        for fn in fs:
            if fn.endswith(".tsx") and strip(os.path.join(dp,fn)):
                changed.append(os.path.join(dp,fn).replace(BASE+"\\",""))
# app root files
for fn in ["page.tsx","not-found.tsx"]:
    p=os.path.join(APP,fn)
    if os.path.isfile(p) and strip(p): changed.append("app\\"+fn)
print("storefront files de-emoji'd:", len(changed))
for f in changed: print("  ", f)
