import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface ChangePasswordModalProps {
    passwordModalVisible: boolean;
    closePasswordModal: () => void;
    currentPassword: string;
    setCurrentPassword: (password: string) => void;
    showCurrentPassword: boolean;
    setShowCurrentPassword: (show: boolean) => void;
    newPassword: string;
    setNewPassword: (password: string) => void;
    showNewPassword: boolean;
    setShowNewPassword: (show: boolean) => void;
    confirmPassword: string;
    setConfirmPassword: (password: string) => void;
    showConfirmPassword: boolean;
    setShowConfirmPassword: (show: boolean) => void;
    isSubmitting: boolean;
    submitPasswordChange: () => void;
    newPasswordRef: React.RefObject<TextInput>;
    confirmPasswordRef: React.RefObject<TextInput>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
                                                                            passwordModalVisible,
                                                                            closePasswordModal,
                                                                            currentPassword,
                                                                            setCurrentPassword,
                                                                            showCurrentPassword,
                                                                            setShowCurrentPassword,
                                                                            newPassword,
                                                                            setNewPassword,
                                                                            showNewPassword,
                                                                            setShowNewPassword,
                                                                            confirmPassword,
                                                                            setConfirmPassword,
                                                                            showConfirmPassword,
                                                                            setShowConfirmPassword,
                                                                            isSubmitting,
                                                                            submitPasswordChange,
                                                                            newPasswordRef,
                                                                            confirmPasswordRef
                                                                        }) => {

    const { colors } = useTheme();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={passwordModalVisible}
            onRequestClose={closePasswordModal}
        >
            <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
                        <TouchableOpacity onPress={closePasswordModal}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Current Password</Text>
                            <View style={styles.passwordInputWrapper}>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                    secureTextEntry={!showCurrentPassword}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor={colors.text + "80"}
                                    returnKeyType="next"
                                    onSubmitEditing={() => newPasswordRef.current?.focus()}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    <Ionicons
                                        name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={colors.text}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>New Password</Text>
                            <View style={styles.passwordInputWrapper}>
                                <TextInput
                                    ref={newPasswordRef}
                                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor={colors.text + "80"}
                                    returnKeyType="next"
                                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Ionicons
                                        name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={colors.text}
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.passwordHint, { color: colors.text + "80" }]}>
                                Password must be at least 8 characters
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm New Password</Text>
                            <View style={styles.passwordInputWrapper}>
                                <TextInput
                                    ref={confirmPasswordRef}
                                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={colors.text + "80"}
                                    returnKeyType="done"
                                    onSubmitEditing={submitPasswordChange}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={colors.text}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                            onPress={closePasswordModal}
                            disabled={isSubmitting}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.modalButton,
                                styles.submitButton,
                                { backgroundColor: colors.primary },
                                isSubmitting && { opacity: 0.7 }
                            ]}
                            onPress={submitPasswordChange}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Update</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBody: {
        padding: 16,
        maxHeight: 400,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        height: 50,
        justifyContent: 'center',
    },
    passwordHint: {
        fontSize: 12,
        marginTop: 4,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    modalButton: {
        flex: 1,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        marginRight: 8,
        borderWidth: 1,
    },
    submitButton: {
        marginLeft: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChangePasswordModal;