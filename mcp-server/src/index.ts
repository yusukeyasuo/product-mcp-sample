#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// 現在のファイルのディレクトリパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// データベースファイルのパス（プロジェクトルートのdatabaseフォルダ）
const dbPath = join(__dirname, "../../database/products.db");

// データベース接続
const db = new sqlite3.Database(dbPath);

// MCPサーバーの作成
const server = new Server(
  {
    name: "product-manager",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツール一覧の定義
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_products",
        description: "商品を検索します。カテゴリや商品名で絞り込みができます。",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "検索キーワード（商品名の部分一致）",
            },
            category: {
              type: "string",
              description: "カテゴリ名（完全一致）",
            },
          },
        },
      },
      {
        name: "get_product",
        description: "商品IDを指定して商品の詳細情報を取得します。",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "商品ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "update_stock",
        description: "商品の在庫数を更新します。",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "商品ID",
            },
            stock: {
              type: "number",
              description: "新しい在庫数",
            },
          },
          required: ["id", "stock"],
        },
      },
      {
        name: "update_price",
        description: "商品の価格を更新します。",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "商品ID",
            },
            price: {
              type: "number",
              description: "新しい価格",
            },
          },
          required: ["id", "price"],
        },
      },
			{
				name: "create_product",
				description: "新しい商品を登録します。",
				inputSchema: {
					type: "object",
					properties: {
						name: {
							type: "string",
							description: "商品名",
						},
						price: {
							type: "number",
							description: "価格",
						},
						stock: {
							type: "number",
							description: "在庫数",
						},
						category: {
							type: "string",
							description: "カテゴリ",
						},
					},
					required: ["name", "price", "stock"],
				},
			},
    ],
  };
});

// ツール実行の処理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_products": {
        const { keyword, category } = args as {
          keyword?: string;
          category?: string;
        };

        let query = "SELECT * FROM products WHERE 1=1";
        const params: any[] = [];

        if (keyword) {
          query += " AND name LIKE ?";
          params.push(`%${keyword}%`);
        }

        if (category) {
          query += " AND category = ?";
          params.push(category);
        }

        const products = await new Promise((resolve, reject) => {
          db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(products, null, 2),
            },
          ],
        };
      }

      case "get_product": {
        const { id } = args as { id: number };

        const product = await new Promise((resolve, reject) => {
          db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (!product) {
          return {
            content: [
              {
                type: "text",
                text: `商品ID ${id} は見つかりませんでした。`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(product, null, 2),
            },
          ],
        };
      }

      case "update_stock": {
        const { id, stock } = args as { id: number; stock: number };

        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE products SET stock = ? WHERE id = ?",
            [stock, id],
            function (err) {
              if (err) reject(err);
              else if (this.changes === 0)
                reject(new Error(`商品ID ${id} は見つかりませんでした`));
              else resolve(this);
            }
          );
        });

        return {
          content: [
            {
              type: "text",
              text: `商品ID ${id} の在庫を ${stock} に更新しました。`,
            },
          ],
        };
      }

      case "update_price": {
        const { id, price } = args as { id: number; price: number };

        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE products SET price = ? WHERE id = ?",
            [price, id],
            function (err) {
              if (err) reject(err);
              else if (this.changes === 0)
                reject(new Error(`商品ID ${id} は見つかりませんでした`));
              else resolve(this);
            }
          );
        });

        return {
          content: [
            {
              type: "text",
              text: `商品ID ${id} の価格を ${price}円 に更新しました。`,
            },
          ],
        };
      }

      case "create_product": {
        const { name, price, stock, category } = args as {
          name: string;
          price: number;
          stock: number;
          category?: string;
        };

        const result = await new Promise<number>((resolve, reject) => {
          db.run(
            "INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)",
            [name, price, stock, category || null],
            function (err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });

        return {
          content: [
            {
              type: "text",
              text: `商品「${name}」を登録しました（商品ID: ${result}）`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `エラーが発生しました: ${error}`,
        },
      ],
      isError: true,
    };
  }
});

// サーバーの起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Product MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
