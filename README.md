# Takizawabot

Watch updates of [@h_Takizawa329](https://twitter.com/h_Takizawa329)'s Twitter account profiles and Tweet when changes are made.  
By changing `TARGET_USER_ID` in [constants.ts](constants.ts), you can watch any Twitter user if the profile is accessible (i.e. if the user's profile is public or your bot is following the user).

This bot is running on [@bioBOT52342033](https://twitter.com/bioBOT52342033).

## Installation

```
npm i
npm run build
cp .env.example .env
$EDITOR .env # Update .env to provide your own API keys
```

## Usage

```
npm start
```

## Development

For development, you can use `npm run dev` so you don't need to spend time on building.  
Use `NO_TWEET=true` when you want to turn off Tweet functionality.
