# Yahan se start karein

## 1. ZIP extract karein

Project folder ka naam `countercrave-nextjs` hai.

## 2. Local site chalayein

Node.js 20.9 ya usse naya version install hona chahiye.

```bash
npm install
npm run products:generate
npm run dev
```

Browser mein open karein:

```text
http://localhost:3000
```

Saare planned drafts dekhne ke liye:

```text
http://localhost:3000/content-plan/
```

## 3. Amazon affiliate link banana

Ek ASIN ka link turant banane ke liye:

```bash
npm run amazon:link -- YOUR10CHARASIN
```

Output mein automatically Store ID `visitbest07-20` lagegi.

Bulk product cards ke liye:

1. `data/product-import-template.csv` open karein.
2. Product name aur ASIN fill karein.
3. Creators API, SiteStripe ya licensed source ka image URL fill karein.
4. Run karein:

```bash
npm run products:generate
npm run validate
```

## 4. Content publish karna

`content/pages/` mein har planned page ki alag JSON file hai.

Page tabhi live karein jab:

- summary complete ho;
- sections mein original content ho;
- facts verify ho;
- products aur ASIN validate ho;
- draft ko `false` karein;
- noindex ko `false` karein;
- publishedAt aur updatedAt fill karein.

## 5. GitHub par push

```bash
git init
git add .
git commit -m "Initial CounterCrave site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/countercrave.git
git push -u origin main
```

Uske baad GitHub repository ko Vercel mein import karein.
