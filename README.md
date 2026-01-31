# Product MCP Sample

MCPを使った商品管理システムのサンプルプロジェクトです。

## 概要

このプロジェクトは、Model Context Protocol (MCP) を学習するためのサンプル実装です。
SQLiteデータベースと連携し、Claude経由で商品情報を自然言語で操作できます。

## 機能

- 商品の検索（キーワード、カテゴリ）
- 商品情報の取得
- 在庫数の更新
- 価格の更新

## 技術スタック

- **MCP Server**: TypeScript, @modelcontextprotocol/sdk
- **Database**: SQLite
- **Client**: Claude Desktop

## 開発環境

- Node.js v18以上
- TypeScript
- SQLite3

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/あなたのユーザー名/product-mcp-sample.git
cd product-mcp-sample
```

### 2. データベースの初期化
```bash
cd database
sqlite3 products.db < init.sql
cd ..
```

### 3. MCPサーバーのビルド
```bash
cd mcp-server
npm install
npm run build
cd ..
```

### 4. Claude Desktopの設定

Claude Desktopの設定ファイル `claude_desktop_config.json` を編集します。

**Macの場合:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windowsの場合:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

以下の内容を追加してください（パスは適宜変更）：
```json
{
  "mcpServers": {
    "product-manager": {
      "command": "node",
      "args": [
        "/絶対パス/product-mcp-sample/mcp-server/dist/index.js"
      ]
    }
  }
}
```

### 5. Claude Desktopの再起動

Claude Desktopを完全に終了して再起動してください。

## 使い方

Claude Desktopで以下のような操作が可能です：

- 「全ての商品を教えてください」
- 「アパレルカテゴリの商品を教えてください」
- 「Tシャツという名前が含まれる商品を探してください」
- 「商品ID 1 の在庫を100に変更してください」
- 「ジーンズの価格を7500円に変更してください」

## プロジェクト構成
```
product-mcp-sample/
├── README.md
├── .gitignore
├── database/
│   ├── init.sql          # DB初期化スクリプト
│   └── products.db       # SQLiteデータベース（Gitで管理しない）
└── mcp-server/
    ├── src/
    │   └── index.ts      # MCPサーバー本体
    ├── dist/             # ビルド成果物（Gitで管理しない）
    ├── package.json
    └── tsconfig.json
```

## トラブルシューティング

### 🔨マークが表示されない

1. Claude Desktopを完全に再起動
2. 設定ファイルのパスが正しいか確認
3. ターミナルで `npm run dev` を実行してエラーを確認

### "商品が見つかりません"と言われる

データベースが正しく作成されているか確認：
```bash
sqlite3 database/products.db "SELECT * FROM products;"
```

## ライセンス

MIT
