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
wscat --connect wss://ll.ivkin.dev/ws
```

Docker tips
```bash
docker run -dit --name=ll -v ~/llfront:/usr/loveletter/ui -p 8081:8081 47c95378cc75
docker logs $(sudo docker ps -aq --filter name=ll)
docker exec -t -i ll /bin/sh
docker rm -f $(docker ps -a -q)
```

From the EC2
```bash
docker pull ivkin/backyard-tails
docker stop ivkin/backyard-tails
docker rm -f ivkin/backyard-tails
docker run -dit -p 8081:8081 \
 --mount type=volume,dst=/usr/loveletter/ui,volume-driver=local,volume-opt=type=none,volume-opt=o=bind,volume-opt=device=/home/ubuntu/llfront \
 ivkin/backyard-tails:latest
```