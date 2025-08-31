# Collections Insomnia - Directus Meme Manager

Cette documentation contient les collections Insomnia prêtes à l'emploi pour tester l'API Directus Meme Manager.

## Collection JSON complète

```json
{
  "_type": "export",
  "__export_format": 4,
  "__export_date": "2025-01-01T00:00:00.000Z",
  "__export_source": "insomnia.desktop.app:v8.0.0",
  "resources": [
    {
      "_id": "wrk_meme_manager",
      "_type": "workspace",
      "name": "Directus Meme Manager API",
      "description": "API complète pour l'application de gestion de memes"
    },
    {
      "_id": "env_base",
      "_type": "environment",
      "name": "Base Environment",
      "data": {
        "base_url": "http://localhost:8055",
        "token": ""
      }
    },
    {
      "_id": "fld_auth",
      "_type": "request_group",
      "name": "🔐 Authentification",
      "description": "Endpoints de gestion des utilisateurs"
    },
    {
      "_id": "req_login",
      "_type": "request",
      "name": "Login",
      "method": "POST",
      "url": "{{ _.base_url }}/auth/login",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
      }
    },
    {
      "_id": "req_logout",
      "_type": "request",
      "name": "Logout",
      "method": "POST",
      "url": "{{ _.base_url }}/auth/logout",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ]
    },
    {
      "_id": "fld_files",
      "_type": "request_group",
      "name": "📁 Files & Upload",
      "description": "Gestion des fichiers et images"
    },
    {
      "_id": "req_upload",
      "_type": "request",
      "name": "Upload Image",
      "method": "POST",
      "url": "{{ _.base_url }}/files",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ],
      "body": {
        "mimeType": "multipart/form-data",
        "params": [
          {
            "name": "file",
            "type": "file",
            "fileName": ""
          }
        ]
      }
    },
    {
      "_id": "req_transform_image",
      "_type": "request",
      "name": "Transform Image",
      "method": "GET",
      "url": "{{ _.base_url }}/assets/[FILE-UUID]?width=400&height=400&fit=cover&quality=85&format=webp"
    },
    {
      "_id": "fld_tags",
      "_type": "request_group",
      "name": "🏷️ Tags",
      "description": "Gestion des tags"
    },
    {
      "_id": "req_get_tags",
      "_type": "request",
      "name": "Get All Tags",
      "method": "GET",
      "url": "{{ _.base_url }}/items/tags"
    },
    {
      "_id": "req_create_tag",
      "_type": "request",
      "name": "Create Tag",
      "method": "POST",
      "url": "{{ _.base_url }}/items/tags",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"name\": \"humor\"\n}"
      }
    },
    {
      "_id": "fld_memes",
      "_type": "request_group",
      "name": "🎭 Memes",
      "description": "Gestion des memes"
    },
    {
      "_id": "req_get_memes",
      "_type": "request",
      "name": "Get All Memes",
      "method": "GET",
      "url": "{{ _.base_url }}/items/memes?fields=*,tags.tags_id.name,user_created.first_name,user_created.last_name,memes_likes.user_id.first_name"
    },
    {
      "_id": "req_get_meme",
      "_type": "request",
      "name": "Get Single Meme",
      "method": "GET",
      "url": "{{ _.base_url }}/items/memes/[MEME-UUID]?fields=*,tags.tags_id.*,user_created.*,memes_likes.user_id.*"
    },
    {
      "_id": "req_create_meme",
      "_type": "request",
      "name": "Create Meme",
      "method": "POST",
      "url": "{{ _.base_url }}/items/memes",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"title\": \"Mon premier meme\",\n  \"image\": \"[FILE-UUID]\",\n  \"text_top\": \"Quand tu debugs\",\n  \"text_bottom\": \"Et ça marche du premier coup\",\n  \"tags\": [\n    {\"tags_id\": \"[TAG-UUID-HUMOR]\"},\n    {\"tags_id\": \"[TAG-UUID-PROGRAMMATION]\"}\n  ]\n}"
      }
    },
    {
      "_id": "req_update_meme",
      "_type": "request",
      "name": "Update My Meme",
      "method": "PATCH",
      "url": "{{ _.base_url }}/items/memes/[MEME-UUID]",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"title\": \"Titre modifié\",\n  \"text_top\": \"Nouveau texte du haut\"\n}"
      }
    },
    {
      "_id": "req_delete_meme",
      "_type": "request",
      "name": "Delete My Meme",
      "method": "DELETE",
      "url": "{{ _.base_url }}/items/memes/[MEME-UUID]",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ]
    },
    {
      "_id": "fld_likes",
      "_type": "request_group",
      "name": "❤️ Likes",
      "description": "Système de likes"
    },
    {
      "_id": "req_like_meme",
      "_type": "request",
      "name": "Like Meme",
      "method": "POST",
      "url": "{{ _.base_url }}/items/memes_likes",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"meme_id\": \"[MEME-UUID]\"\n}"
      }
    },
    {
      "_id": "req_unlike_meme",
      "_type": "request",
      "name": "Unlike Meme",
      "method": "DELETE",
      "url": "{{ _.base_url }}/items/memes_likes/[LIKE-UUID]",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ]
    },
    {
      "_id": "req_get_likes",
      "_type": "request",
      "name": "Get Meme Likes",
      "method": "GET",
      "url": "{{ _.base_url }}/items/memes_likes?filter[meme_id][_eq]=[MEME-UUID]&fields=*,user_id.first_name,user_id.last_name"
    },
    {
      "_id": "fld_notifications",
      "_type": "request_group",
      "name": "🔔 Notifications",
      "description": "Système de notifications temps réel"
    },
    {
      "_id": "req_get_notifications",
      "_type": "request",
      "name": "Get My Notifications",
      "method": "GET",
      "url": "{{ _.base_url }}/items/notifications?filter[user_id][_eq]=$CURRENT_USER&fields=*,meme_id.title&sort=-date_created",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ]
    },
    {
      "_id": "req_mark_read",
      "_type": "request",
      "name": "Mark Notification Read",
      "method": "PATCH",
      "url": "{{ _.base_url }}/items/notifications/[NOTIFICATION-UUID]",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"is_read\": true\n}"
      }
    },
    {
      "_id": "fld_websockets",
      "_type": "request_group",
      "name": "🔄 WebSockets",
      "description": "Tests en temps réel"
    },
    {
      "_id": "req_websocket_connect",
      "_type": "websocket_request",
      "name": "Connect to Directus Realtime",
      "url": "ws://localhost:8055/websocket",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ],
      "description": "Connexion WebSocket pour les notifications temps réel"
    }
  ]
}
```

## Variables d'environnement

### Base Environment
```json
{
  "base_url": "http://localhost:8055",
  "token": ""
}
```

### Variables dynamiques à renseigner
Après utilisation des endpoints, remplacer :

- `[FILE-UUID]` : UUID retourné par l'upload d'image
- `[TAG-UUID-*]` : UUIDs des tags créés
- `[MEME-UUID]` : UUID du meme créé
- `[LIKE-UUID]` : UUID du like créé
- `[NOTIFICATION-UUID]` : UUID de la notification
- `{{ _.token }}` : Token JWT retourné par le login

## Workflow d'utilisation

1. **Importer la collection** dans Insomnia
2. **Login** → copier le `access_token` dans la variable `token`
3. **Upload d'image** → récupérer l'UUID du fichier
4. **Créer des tags** → récupérer les UUIDs
5. **Créer un meme** avec les UUIDs précédents
6. **Tester les likes** et notifications
7. **WebSocket** pour le temps réel

## Notes techniques

- **Authentification** : Bearer Token automatiquement inclus via variable
- **Relations** : Utilisation des UUIDs pour lier les collections
- **Permissions** : Respecte les règles de sécurité Directus
- **WebSocket** : Nécessite token JWT dans les headers