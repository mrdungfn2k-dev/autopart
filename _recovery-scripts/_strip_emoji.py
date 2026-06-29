import os, io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
BASE = r"C:\xampp2\htdocs\autopart-backup\autoparts-source\app"
roots = ["admin","supplier","affiliate","customer"]
# decorative emojis to REMOVE (keep functional ✓ ✕ ✎ — and digits/text)
DECOR = "📥📤📂🔥⭐🌍🔧🌐📦📌⬇⬆⚠🎁🏆💎🥇✨🔔📊📈📉💰🚀🛒🏠🚗🔑📝🎯⚡💡🎨🖼🔗📞✉📧🗑🏷🧾📋🛠🪪🚙🇻🇳❤️♥💵🏬📡🌟💳"
changed=[]
for r in roots:
    for dp,_,files in os.walk(os.path.join(BASE,r)):
        for fn in files:
            if not fn.endswith(".tsx"): continue
            p=os.path.join(dp,fn); s=open(p,encoding="utf-8").read(); orig=s
            for ch in DECOR:
                s=s.replace(ch+" ", "").replace(" "+ch, "").replace(ch, "")
            # collapse ">  <" extra spaces left in text nodes
            s=re.sub(r'>\s{2,}([^<\s])', r'>\1', s)
            if s!=orig:
                open(p,"w",encoding="utf-8").write(s); changed.append(p.replace(BASE+"\\",""))
print("Files de-emoji'd:", len(changed))
for f in changed: print("  ", f)
