#!/bin/sh

wget http://dl-cdn.alpinelinux.org/alpine/v3.8/releases/x86_64/alpine-minirootfs-3.8.1-x86_64.tar.gz
mkdir RootFS
tar -xzvf alpine-minirootfs-3.8.1-x86_64.tar.gz -C RootFS
rm -rf alpine-minirootfs-3.8.1-x86_64.tar.gz
sudo mount -t proc proc RootFS/proc/
sudo mount -t sysfs sys RootFS/sys/
sudo mount -o bind /dev RootFS/dev/
sudo mount -o bind /dev RootFS/dev/pts
cp /etc/resolv.conf RootFS/etc
