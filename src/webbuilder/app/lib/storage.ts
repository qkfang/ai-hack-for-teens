import { promises as fs } from "fs";
import path from "path";

export interface CodeFile {
  filename: string;
  content: string;
}

export interface CodeBundle {
  files: Record<string, string>;
  entrypoint: string;
  version: number;
  updatedAt: string;
}

export interface UserData {
  id: string;
  name: string;
  createdAt: string;
}

export interface StorageProvider {
  getUser(userId: string): Promise<UserData | null>;
  createUser(name: string): Promise<UserData>;
  updateUser(userId: string, updates: Partial<UserData>): Promise<UserData>;
  listUsers(): Promise<UserData[]>;
  getCodeBundle(userId: string): Promise<CodeBundle | null>;
  saveCodeBundle(userId: string, bundle: CodeBundle): Promise<void>;
  deleteCodeBundle(userId: string): Promise<void>;
  getDefaultTemplate(): Promise<CodeBundle>;
  getVoters(userId: string): Promise<string[]>;
  toggleVote(fromUserId: string, toUserId: string): Promise<{ voted: boolean }>;
  getAllVotes(): Promise<Record<string, string[]>>;
}

export class FileSystemStorageProvider implements StorageProvider {
  private baseDir: string;
  private templateDir: string;
  private usersFile: string;
  private votesFile: string;

  constructor(sampleName?: string) {
    const activeSample = sampleName || process.env.SAMPLE_NAME || "startup-app";
    this.baseDir = path.join(process.cwd(), ".user-data");
    this.templateDir = path.join(process.cwd(), "samples", activeSample, "template");
    this.usersFile = path.join(this.baseDir, "users.json");
    this.votesFile = path.join(this.baseDir, "votes.json");
  }

  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  }

  private async readJsonFile<T>(filePath: string): Promise<T | null> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  private async writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  private getUserDir(userId: string): string {
    return path.join(this.baseDir, userId);
  }

  async getUser(userId: string): Promise<UserData | null> {
    const users = await this.readJsonFile<UserData[]>(this.usersFile);
    return users?.find((u) => u.id === userId) || null;
  }

  async createUser(name: string): Promise<UserData> {
    const users = (await this.readJsonFile<UserData[]>(this.usersFile)) || [];
    const newUser: UserData = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await this.writeJsonFile(this.usersFile, users);
    await this.ensureDir(this.getUserDir(newUser.id));
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<UserData>): Promise<UserData> {
    const users = (await this.readJsonFile<UserData[]>(this.usersFile)) || [];
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) throw new Error(`User ${userId} not found`);
    users[userIndex] = { ...users[userIndex], ...updates, id: userId };
    await this.writeJsonFile(this.usersFile, users);
    return users[userIndex];
  }

  async listUsers(): Promise<UserData[]> {
    return (await this.readJsonFile<UserData[]>(this.usersFile)) || [];
  }

  async getCodeBundle(userId: string): Promise<CodeBundle | null> {
    const userDir = this.getUserDir(userId);
    const bundlePath = path.join(userDir, "bundle.json");
    const filesDir = path.join(userDir, "files");

    const bundleMeta = await this.readJsonFile<{
      entrypoint: string;
      version: number;
      updatedAt: string;
      files: string[];
    }>(bundlePath);

    if (!bundleMeta) return null;

    const files: Record<string, string> = {};
    for (const filename of bundleMeta.files) {
      try {
        const filePath = path.join(filesDir, filename);
        files[filename] = await fs.readFile(filePath, "utf-8");
      } catch {
        // skip missing files
      }
    }

    return {
      files,
      entrypoint: bundleMeta.entrypoint,
      version: bundleMeta.version,
      updatedAt: bundleMeta.updatedAt,
    };
  }

  async saveCodeBundle(userId: string, bundle: CodeBundle): Promise<void> {
    const userDir = this.getUserDir(userId);
    const bundlePath = path.join(userDir, "bundle.json");
    const filesDir = path.join(userDir, "files");

    await this.ensureDir(filesDir);

    for (const [filename, content] of Object.entries(bundle.files)) {
      const filePath = path.join(filesDir, filename);
      await this.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, "utf-8");
    }

    await this.writeJsonFile(bundlePath, {
      entrypoint: bundle.entrypoint,
      version: bundle.version,
      updatedAt: bundle.updatedAt,
      files: Object.keys(bundle.files),
    });
  }

  async deleteCodeBundle(userId: string): Promise<void> {
    const userDir = this.getUserDir(userId);
    const filesDir = path.join(userDir, "files");
    try {
      await fs.rm(filesDir, { recursive: true, force: true });
      await fs.unlink(path.join(userDir, "bundle.json"));
    } catch {
      // Files might not exist
    }
  }

  async getVoters(userId: string): Promise<string[]> {
    const votes = (await this.readJsonFile<Record<string, string[]>>(this.votesFile)) || {};
    return votes[userId] || [];
  }

  async toggleVote(fromUserId: string, toUserId: string): Promise<{ voted: boolean }> {
    const votes = (await this.readJsonFile<Record<string, string[]>>(this.votesFile)) || {};
    const voters = votes[toUserId] || [];
    const index = voters.indexOf(fromUserId);
    const voted = index === -1;
    if (voted) {
      voters.push(fromUserId);
    } else {
      voters.splice(index, 1);
    }
    votes[toUserId] = voters;
    await this.writeJsonFile(this.votesFile, votes);
    return { voted };
  }

  async getAllVotes(): Promise<Record<string, string[]>> {
    return (await this.readJsonFile<Record<string, string[]>>(this.votesFile)) || {};
  }

  async getDefaultTemplate(): Promise<CodeBundle> {
    try {
      const manifestPath = path.join(this.templateDir, "manifest.json");
      const manifestContent = await fs.readFile(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestContent) as {
        name: string;
        version: string;
        description: string;
        entrypoint: string;
        files: string[];
      };

      const files: Record<string, string> = {};
      for (const filename of manifest.files) {
        const filePath = path.join(this.templateDir, filename);
        files[filename] = await fs.readFile(filePath, "utf-8");
      }

      return {
        files,
        entrypoint: manifest.entrypoint,
        version: 0,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to load default template:", error);
      return {
        files: {
          "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
</head>
<body>
  <h1>Welcome</h1>
  <p>Start chatting with Copilot to build your page!</p>
</body>
</html>`,
        },
        entrypoint: "index.html",
        version: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  }
}

export const storage = new FileSystemStorageProvider();
