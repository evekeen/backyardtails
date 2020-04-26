# from server to client
## setTable
* players on the table
* deck state in the middle

## loadCard
* load initial card of current player

## startTurn
* draw a new card from the deck
* make current player active

## ka
keep alive - TBD just to keep connection active?

## ready
server is ready to receive messages

#from client to server

## general-shape
general shape of the message
```
{
  "type": type,
  "payload": data,
  "meta": "remote"
}
```
### Types
to join a game
```
connection/join
```

when a player plays a card on a player
```
cardAction
```