Follow certbot instructions from the website

Setup docker
```
sudo apt-get install docker
sudo usermod -a -G docker ubuntu
```
logout and log-in back

Test WS connection from your computer
```
npm i -g wscat
wscat --connect wss://ll.ivkin.dev:443
```

Docker tips
```bash
docker run -dit --name=ll -v ~/llfront:/usr/loveletter/ui -p 8081:8081 47c95378cc75
docker logs $(sudo docker ps -aq --filter name=ll)
docker exec -t -i ll /bin/sh
docker rm -f $(docker ps -a -q)
```