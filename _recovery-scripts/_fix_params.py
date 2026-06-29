import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
BASE = r"C:\xampp2\htdocs\autopart-backup\autoparts-source\app\api"
files = ["garage\\[id]", "home-sections\\[id]", "origins\\[id]"]
for f in files:
    p = BASE + "\\" + f + "\\route.ts"
    s = open(p, encoding="utf-8").read(); o = s
    s = s.replace("{ params }: { params: { id: string } }", "{ params }: { params: Promise<{ id: string }> }")
    s = s.replace("Promise<{ id: string }> }) {", "Promise<{ id: string }> }) {\n  const { id } = await params;")
    s = s.replace("params.id", "id")
    if s != o:
        open(p, "w", encoding="utf-8").write(s)
        print("fixed:", f, "| await-lines:", s.count("const { id } = await params;"))
    else:
        print("nochange:", f)
