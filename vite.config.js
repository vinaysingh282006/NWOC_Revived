import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

// Tiny inline plugin: copies css/ and js/ to dist/ after build
function copyStaticDirs(dirs) {
    return {
        name: 'copy-static-dirs',
        closeBundle() {
            for (const dir of dirs) {
                const src = resolve(__dirname, dir)
                const dest = resolve(__dirname, 'dist', dir)
                if (fs.existsSync(src)) {
                    fs.mkdirSync(dest, { recursive: true })
                    copyRecursive(src, dest)
                }
            }
        }
    }
}

function copyRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true })
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true })
            copyRecursive(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}

export default defineConfig({
    root: '.',
    publicDir: 'public',
    plugins: [
        copyStaticDirs(['css', 'js'])
    ],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: { main: resolve(__dirname, 'index.html') }
        }
    },
    server: {
        port: 3000,
        open: true,
        // Serve css/ and js/ from root during dev
        fs: {
            allow: ['.']
        }
    }
})
