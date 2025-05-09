import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarUploadProps {
    currentAvatarUrl: string;
    onAvatarUpdated: (imageAsset: ImagePicker.ImagePickerAsset) => void;
    isUploading?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
                                                              currentAvatarUrl,
                                                              onAvatarUpdated,
                                                              isUploading = false
                                                          }) => {
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const menuRef = useRef(null);
    const [menuVisible, setMenuVisible] = useState(false);

    // Effect to set the avatar when currentAvatarUrl changes or on initial load
    useEffect(() => {
        if (currentAvatarUrl && currentAvatarUrl.trim() !== '') {
            setAvatarUri(currentAvatarUrl);
        }
    }, [currentAvatarUrl]);

    const pickImage = async (useCamera: boolean = false) => {
        setMenuVisible(false);

        let result;
        if (useCamera) {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
                return;
            }

            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
        }

        if (!result.canceled && result.assets && result.assets[0]) {
            const selectedAsset = result.assets[0];

            // Get file name or generate one if not available
            if (!selectedAsset.fileName) {
                const uriParts = selectedAsset.uri.split('/');
                const nameWithExtension = uriParts[uriParts.length - 1];

                // Create a copy of the asset with the fileName added
                const assetWithFileName = {
                    ...selectedAsset,
                    fileName: nameWithExtension || `photo_${Date.now()}.jpg`
                };

                setAvatarUri(assetWithFileName.uri);
                onAvatarUpdated(assetWithFileName);
            } else {
                setAvatarUri(selectedAsset.uri);
                onAvatarUpdated(selectedAsset);
            }
        }
    };

    const toggleMenu = () => {
        if (menuVisible) {
            opacity.value = withTiming(0, { duration: 200 });
            setTimeout(() => setMenuVisible(false), 200);
        } else {
            setMenuVisible(true);
            opacity.value = withTiming(1, { duration: 200 });
        }
    };

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const menuAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                {
                    translateY: interpolate(
                        opacity.value,
                        [0, 1],
                        [10, 0],
                        Extrapolate.CLAMP
                    )
                }
            ],
        };
    });

    // Get initials for placeholder avatar
    const getInitials = () => {
        return "JP"; // This would ideally be derived from user's name
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.avatarContainer, animatedStyle]}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={toggleMenu}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.avatarTouchable}
                >
                    {avatarUri ? (
                        <Image
                            source={{ uri: avatarUri }}
                            style={styles.avatar}
                            // Add fallback/error handling
                            onError={() => {
                                console.log("Error loading image from URI:", avatarUri);
                                setAvatarUri(null);
                            }}
                        />
                    ) : (
                        <LinearGradient
                            colors={['#8e2de2', '#4a00e0']}
                            style={styles.placeholderAvatar}
                        >
                            <Text style={styles.placeholderText}>
                                {getInitials()}
                            </Text>
                        </LinearGradient>
                    )}

                    {isUploading ? (
                        <View style={styles.uploadingOverlay}>
                            <BlurView intensity={30} style={styles.blurView}>
                                <ActivityIndicator color="#ffffff" size="small" />
                            </BlurView>
                        </View>
                    ) : (
                        <BlurView intensity={70} tint="dark" style={styles.editButton}>
                            <Feather name="edit-2" size={16} color="#ffffff" />
                        </BlurView>
                    )}
                </TouchableOpacity>
            </Animated.View>

            {menuVisible && (
                <Animated.View
                    ref={menuRef}
                    style={[styles.menuContainer, menuAnimatedStyle]}
                >
                    <BlurView intensity={90} tint="dark" style={styles.menu}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => pickImage(false)}
                        >
                            <MaterialIcons name="photo-library" size={20} color="#ffffff" />
                            <Text style={styles.menuText}>Choose from library</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => pickImage(true)}
                        >
                            <MaterialIcons name="camera-alt" size={20} color="#ffffff" />
                            <Text style={styles.menuText}>Take a photo</Text>
                        </TouchableOpacity>

                        {avatarUri && (
                            <TouchableOpacity
                                style={[styles.menuItem, styles.removeItem]}
                                onPress={() => {
                                    setAvatarUri(null);
                                    // Create an asset with empty URI to signal removal
                                    const emptyAsset: ImagePicker.ImagePickerAsset = {
                                        uri: '',
                                        width: 0,
                                        height: 0,
                                        assetId: null,
                                        fileName: 'removed.jpg',
                                        type: 'image',
                                        fileSize: 0,
                                        duration: null,
                                        exif: null
                                    };
                                    onAvatarUpdated(emptyAsset);
                                    toggleMenu();
                                }}
                            >
                                <MaterialIcons name="delete" size={20} color="#ff4d4f" />
                                <Text style={[styles.menuText, styles.removeText]}>Remove photo</Text>
                            </TouchableOpacity>
                        )}
                    </BlurView>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 20,
        position: 'relative',
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarTouchable: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    placeholderAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 60,
    },
    blurView: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        position: 'absolute',
        top: 130,
        zIndex: 100,
        width: 220,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    menu: {
        overflow: 'hidden',
        borderRadius: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    menuText: {
        color: '#ffffff',
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '500',
    },
    removeItem: {
        borderBottomWidth: 0,
    },
    removeText: {
        color: '#ff4d4f',
    },
});

export default AvatarUpload;