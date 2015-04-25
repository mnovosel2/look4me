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
}```



##CREATE USERS

**POST**

*/users/create*

deviceId *string*

deviceOS *string*

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

friends['deviceId','deviceId']  *array*

**RESPONSE**

```{
    "message": "Friends added succesffuly"
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


