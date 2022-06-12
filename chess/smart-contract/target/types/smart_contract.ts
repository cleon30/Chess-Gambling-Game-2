export type SmartContract = {
  "version": "0.1.0",
  "name": "smart_contract",
  "instructions": [
    {
      "name": "initializeGame",
      "accounts": [
        {
          "name": "chess",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "playersMinimum",
          "type": "u32"
        },
        {
          "name": "entryPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "join",
      "accounts": [
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chess",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setWinner",
      "accounts": [
        {
          "name": "chess",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "payOutWinner",
      "accounts": [
        {
          "name": "chess",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "chess",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isFinished",
            "type": "bool"
          },
          {
            "name": "isPaid",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "winner",
            "type": "publicKey"
          },
          {
            "name": "winnerIndex",
            "type": "u32"
          },
          {
            "name": "playersAmount",
            "type": "u32"
          },
          {
            "name": "playersMinimum",
            "type": "u32"
          },
          {
            "name": "entryPrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "submitter",
            "type": "publicKey"
          },
          {
            "name": "idx",
            "type": "u32"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ]
};

export const IDL: SmartContract = {
  "version": "0.1.0",
  "name": "smart_contract",
  "instructions": [
    {
      "name": "initializeGame",
      "accounts": [
        {
          "name": "chess",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "playersMinimum",
          "type": "u32"
        },
        {
          "name": "entryPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "join",
      "accounts": [
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chess",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setWinner",
      "accounts": [
        {
          "name": "chess",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "payOutWinner",
      "accounts": [
        {
          "name": "chess",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "chess",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isFinished",
            "type": "bool"
          },
          {
            "name": "isPaid",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "winner",
            "type": "publicKey"
          },
          {
            "name": "winnerIndex",
            "type": "u32"
          },
          {
            "name": "playersAmount",
            "type": "u32"
          },
          {
            "name": "playersMinimum",
            "type": "u32"
          },
          {
            "name": "entryPrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "submitter",
            "type": "publicKey"
          },
          {
            "name": "idx",
            "type": "u32"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
