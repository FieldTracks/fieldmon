docker build -t fieldmon .
docker run --volume $(pwd):/app -e PATH="$PATH" -p "127.0.0.1:4200:4200" fieldmon
