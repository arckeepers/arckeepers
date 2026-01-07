npm run build
rm -rf ../arckeepers.github.io/*
cp -a dist/* ../arckeepers.github.io/
cd ../arckeepers.github.io
git add .
git commit -m "Update to latest build"
git push