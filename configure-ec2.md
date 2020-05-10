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