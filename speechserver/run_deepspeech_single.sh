#!/bin/bash
# Runs DeepSpeech using the German speech model
# This is just an example, you need to put this script in the correct directory and may change paths and files used.
source ./deepspeech-051/bin/activate
filename=$1
if [[ -f "$filename" ]]; then
	:
else
	exit
fi
deepspeech --model deepspeech-051/german-files/model_tuda+voxforge+mozilla.pb --lm deepspeech-051/german-files/lm.binary --trie deepspeech-051/german-files/trie --alphabet deepspeech-051/german-files/alphabet.txt --audio "$filename" &> log
tail -n 7 log

echo
deactivate
