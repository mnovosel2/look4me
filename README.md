# look4me
# API 
ROOT URL
(https://guarded-ocean-9064.herokuapp.com/)

**COVENTIONS**

--parameters with ? are optional, otherwise required

--parameters in URL are marked with prefix **:** (:deviceId)

##GET USERS

**GET**

*/users/get/:deviceId*

**RESPONSE**

```{
"user": {
    "username": "",
    "email": "",
    "deviceId": "device_id_158",
    "deviceOS": "Android 5.0",
    "connectedUsers": [
    "device_id_9",
    "device_id_7"
    ],
    "longitude": "154.454",
    "latitude": "485.54",
    "createdAt": "2015-04-25T11:03:05.507Z",
    "updatedAt": "2015-04-25T11:07:58.163Z",
    "id": "553b7469ec1d882418e0a0d8"
},
"friends": [
    {
        "username": "",
        "email": "",
        "deviceId": "device_id_7",
        "deviceOS": "Android 5.0",
        "connectedUsers": [
            "device_id_8"
        ],
        "longitude": "",
        "latitude": "",
        "createdAt": "2015-04-25T10:29:04.488Z",
        "updatedAt": "2015-04-25T10:29:31.856Z",
        "id": "553b6c70908fbaf808b4a6a1"
    },
    {
        "username": "",
        "email": "",
        "deviceId": "device_id_9",
        "deviceOS": "Android 5.0",
        "connectedUsers": [
        "device_id_7"
        ],
        "longitude": "",
        "latitude": "",
        "createdAt": "2015-04-25T10:36:11.390Z",
        "updatedAt": "2015-04-25T10:37:14.203Z",
        "id": "553b6e1b5d798dfc1b65fc29"
    }
]
}```



##CREATE USERS

**POST**

*/users/create*

deviceId *string*

deviceOS *string*

registerId? *string*

username? *string*

email? *string*

**RESPONSE**

```{
    "message": "User created succesffuly"
}```


##ADD FRIENDS

**PUT**

*/users/friends*

deviceId *string*

friend(deviceId)  *string*

ticket(invitation ticket from QR code) *string*

**RESPONSE**

```{
    "message": "Friends added succesffuly"
}```

##UPDATE TICKET

**PUT**

*/users/ticket*

deviceId *string*

ticket *string*

**RESPONSE**

```{
    "message": "Ticket updated succesfully"
}```


##UPDATE LOCATION

*users/location*

*PUT*

deviceId *string*

longitude *string*

latitude *string*

**RESPONSE**

```{
    "message": "Location saved succesffuly"
}```


