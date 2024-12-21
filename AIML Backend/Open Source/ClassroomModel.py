# Import Libraries
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Dense, Flatten, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import numpy as np
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os

gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print("GPU is enabled and memory growth is set.")
    except RuntimeError as e:
        print(e)
else:
    print("No GPU detected. Using CPU.")

# Directory paths
train_dir = r"C:\Users\Harish\Desktop\Python\train"  
val_dir = r"C:\Users\Harish\Desktop\Python\valid" 
test_dir = r"C:\Users\Harish\Desktop\Python\test_images"

# Image parameters
IMG_SIZE = (224, 224) 
BATCH_SIZE = 16 
EPOCHS = 20 

# Data augmentation for training
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode="nearest"
)
val_datagen = ImageDataGenerator(rescale=1.0 / 255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical"
)
val_generator = val_datagen.flow_from_directory(
    val_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical"
)

# Define Class Names and Characteristics
classes = ["classroom_images", "classroom_training", "extra_activities", "teacher_teaching"]

# Class parameters (for Documentation)
# classroom_images: Focuses on general structures of classrooms, desks, and boards.
# classroom_training: Looks for groups of students, teachers presenting, or projectors/screens.
# extra_activities: Detects informal arrangements, sports equipment, or creative setups.
# teacher_teaching: Highlights teachers, podiums, or engaged student clusters.

# Model setup
base_model = ResNet50(weights="imagenet", include_top=False, input_shape=(224, 224, 3))
for layer in base_model.layers:
    layer.trainable = False

x = base_model.output
x = Flatten()(x)
x = Dense(256, activation="relu")(x)
x = Dropout(0.5)(x)
predictions = Dense(len(classes), activation="softmax")(x)
model = Model(inputs=base_model.input, outputs=predictions)

model.compile(optimizer=Adam(learning_rate=0.0001),
              loss="categorical_crossentropy",
              metrics=["accuracy"])

# Train the Model
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    steps_per_epoch=train_generator.samples // BATCH_SIZE,
    validation_steps=val_generator.samples // BATCH_SIZE
)

# Save the Model
model.save("classroom_activity_model.h5")
print("Model saved as 'classroom_activity_model.h5'.")

# Test Function
def predict_image(model, image_path, classes, img_size=(224, 224)):
    img = load_img(image_path, target_size=img_size)
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    predictions = model.predict(img_array)
    predicted_class = np.argmax(predictions, axis=1)[0]
    confidence = predictions[0][predicted_class]

    if confidence < 0.5:
        return "No matching class found"
    return f"{classes[predicted_class]} ({confidence * 100:.2f}%)"

# Predict Function for Directory
def predict_images_in_directory(model, test_dir, classes, img_size=(224, 224)):
    for image_name in os.listdir(test_dir):
        image_path = os.path.join(test_dir, image_name)
        result = predict_image(model, image_path, classes, img_size)
        print(f"Image: {image_name} -> Prediction: {result}")

# Load Model and Predict
model = tf.keras.models.load_model("classroom_activity_model.h5")
print("Model loaded successfully.")
predict_images_in_directory(model, test_dir, classes)
