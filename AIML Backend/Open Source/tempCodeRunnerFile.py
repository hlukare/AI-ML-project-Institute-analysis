import os
import pdfplumber
from flask import Flask, request, jsonify
from groq import Groq
import tensorflow as tf
import tempfile
from werkzeug.utils import secure_filename