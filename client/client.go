package main

import (
	"bytes"
	"flag"
	"gopkg.in/fsnotify.v1"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
)

func main() {
	d, err := os.Getwd()
	if err != nil {
		d = "./"
	}

	port := flag.String("http", ":8081", "the listening port")
	dir := flag.String("dir", d, "the working folder")
	debug := flag.Bool("debug", false, "enable/disable debuging mode")
	flag.Parse()

	compiler := filepath.Join(*dir, "compiler.jar")
	_, err = os.Stat(compiler)
	compilerMissing := os.IsNotExist(err)

	jsDir := filepath.Join(*dir, "src")
	_, err = os.Stat(jsDir)
	jsDirMissing := os.IsNotExist(err)

	lock := sync.Mutex{}

	if compilerMissing {
		log.Println("Not found 'compiler.jar', please download it here: http://dl.google.com/closure-compiler/compiler-latest.zip")
	} else if jsDirMissing {
		log.Println("Not found 'src' dir")
	} else {
		watcher, err := fsnotify.NewWatcher()
		if err != nil {
			log.Fatal(err)
		}
		defer watcher.Close()

		go func() {
			for {
				select {
				case event := <-watcher.Events:
					// call compile only for script change
					if event.Op != fsnotify.Chmod && event.Op != fsnotify.Rename {
						if ext := filepath.Ext(event.Name); ext != ".js" && ext != ".json" {
							break
						}

						lock.Lock()
						log.Println("Compiling script...")
						err := compileScript(compiler, jsDir, *debug)
						if err != nil {
							log.Println("Error compiling script:", err)
						}
						log.Println("Done!")
						lock.Unlock()
					}
				case err := <-watcher.Errors:
					log.Println("watcher error:", err)
				}
			}
		}()

		// watch all sub-dir
		err = filepath.Walk(jsDir, func(path string, info os.FileInfo, err error) error {
			if info.IsDir() {
				err := watcher.Add(path)
				if err != nil {
					return err
				}
			}
			return nil
		})
		if err != nil {
			log.Fatal(err)
		}
	}

	lock.Lock()
	err = compileScript(compiler, jsDir, *debug)
	if err != nil {
		log.Println("Error compiling script:", err)
	} else {
		log.Println("Compiling script at", jsDir)
	}
	lock.Unlock()

	log.Println("Serving client at http://localhost" + *port)
	panic(http.ListenAndServe(*port, http.FileServer(http.Dir(*dir))))
}

func compileScript(compiler, jsDir string, debug bool) error {
	args := []string{"-jar", compiler, "--language_in", "ECMASCRIPT5"}
	if debug {
		args = []string{"-jar", compiler, "--language_in", "ECMASCRIPT5", "--formatting", "PRETTY_PRINT", "--compilation_level", "SIMPLE"}
	}
	err := filepath.Walk(filepath.Join(jsDir, "app"), func(path string, info os.FileInfo, err error) error {
		if filepath.Ext(path) == ".js" {
			args = append(args, "--js", path)
		}
		return nil
	})
	if err != nil {
		return err
	}

	cmd := exec.Command("java", args...)
	var out bytes.Buffer
	cmd.Stdout = &out
	var er bytes.Buffer
	cmd.Stderr = &er
	err = cmd.Run()
	if err != nil {
		return err
	}

	// merge with lib file
	libs := []string{}
	filepath.Walk(filepath.Join(jsDir, "lib"), func(path string, info os.FileInfo, err error) error {
		if filepath.Ext(path) == ".js" {
			libs = append(libs, path)
		}
		return nil
	})
	if err != nil {
		return err
	}

	f, err := os.OpenFile(filepath.Join(jsDir, "../js/app.min.js"), os.O_WRONLY, 0600)
	if err != nil {
		return err
	}
	defer f.Close()

	for _, l := range libs {
		f2, err := os.Open(l)
		if err != nil {
			log.Println("Error when open lib file:", err)
			continue
		}
		defer f2.Close()

		_, err = io.Copy(f, f2)
		if err != nil {
			log.Println("Error when copy lib file content:", err)
		} else {
			f.Write([]byte{10, 13})
		}
	}

	_, err = io.Copy(f, &out)

	return err
}
