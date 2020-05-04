# Use cases
## Start a new game
Client sends `connection/createGame` with payload `{gameId: string}`

Server can reply `connection/gameExists` if game has been already created
## Join existing game
Client: 
* Client sends `connection/join` with payload `{gameId: string, userId: string, name?: string}`
* Client can join as a spectator (without a name) first and watch who is the pending game already. When request has name defined, it's entering the game in a ready state

Server: 
* Server can send `connection/userJoined` or `connection/gameNotFound` in response
* If join was successful, server sends `connection/userJoined` about this user to every already joined users including himself

If TCP connection is restored after disconnection, client should send `connection/join` again, so it can re-enter the game

## Play a card
Client sends `cardAction` with payload `{card: number, playerIndex?: number, guess?: number}`

* `playerIndex` - some cards can be played on the player himself, `playerIndex` is undefined then
* `guess` - only applicable for the Guard action

Server
* Server sends `feedback/showFeedback` in reply to `cardAction`
* Server sends `status/addMessage` to every client with the action details

# Other protocol messages
## From server to client:
### setTable
* players on the table
* deck state in the middle

### loadCard
* load initial card of current player

### startTurn
* draw a new card from the deck
* make current player active

### ka
keep alive - TBD just to keep connection active?

### ready
server is ready to receive messages

##from client to server

### general-shape
general shape of the message
```
{
  "type": type,
  "payload": data,
  "meta": "remote"
}
```