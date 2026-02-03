cmake_minimum_required(VERSION 3.20)
project(RevoVideoCore VERSION 1.0.0 LANGUAGES CXX)

# C++17 standard with optimization
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Wall -Wextra")

# Find required packages
find_package(PkgConfig REQUIRED)

# FFmpeg libraries
pkg_check_modules(AVCODEC REQUIRED libavcodec)
pkg_check_modules(AVFORMAT REQUIRED libavformat)
pkg_check_modules(AVUTIL REQUIRED libavutil)
pkg_check_modules(SWSCALE REQUIRED libswscale)
pkg_check_modules(SWRESAMPLE REQUIRED libswresample)
pkg_check_modules(AVFILTER REQUIRED libavfilter)

# OpenGL for GPU acceleration
find_package(OpenGL REQUIRED)

# PortAudio for audio playback
pkg_check_modules(PORTAUDIO REQUIRED portaudio-2.0)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${AVCODEC_INCLUDE_DIRS}
    ${AVFORMAT_INCLUDE_DIRS}
    ${AVUTIL_INCLUDE_DIRS}
    ${SWSCALE_INCLUDE_DIRS}
    ${SWRESAMPLE_INCLUDE_DIRS}
    ${AVFILTER_INCLUDE_DIRS}
    ${OPENGL_INCLUDE_DIR}
    ${PORTAUDIO_INCLUDE_DIRS}
)

# Source files
set(SOURCES
    src/video_decoder.cpp
    src/timeline_engine.cpp
    src/compositor.cpp
    src/effects_pipeline.cpp
    src/audio_mixer.cpp
    src/encoder.cpp
)

# Build static library for Rust FFI
add_library(revo_core STATIC ${SOURCES})

# Link libraries
target_link_libraries(revo_core
    ${AVCODEC_LIBRARIES}
    ${AVFORMAT_LIBRARIES}
    ${AVUTIL_LIBRARIES}
    ${SWSCALE_LIBRARIES}
    ${SWRESAMPLE_LIBRARIES}
    ${AVFILTER_LIBRARIES}
    ${OPENGL_LIBRARIES}
    ${PORTAUDIO_LIBRARIES}
    pthread
    dl
)

# Export library
install(TARGETS revo_core
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
)

install(DIRECTORY include/
    DESTINATION include
)
