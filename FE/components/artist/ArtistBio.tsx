import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useTheme } from "@/context/ThemeContext"

interface ArtistBioProps {
    bio: string
}

const ArtistBio: React.FC<ArtistBioProps> = ({ bio }) => {
    const { colors } = useTheme()
    const [expanded, setExpanded] = useState(false)

    // Truncate bio if not expanded
    const displayBio = expanded ? bio : bio.substring(0, 150) + "..."

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

            <Text style={[styles.bioText, { color: colors.text }]}>
                {displayBio}
            </Text>

            {bio.length > 150 && (
                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                    <Text style={[styles.readMoreText, { color: colors.primary }]}>
                        {expanded ? "Read Less" : "Read More"}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    bioText: {
        fontSize: 16,
        lineHeight: 24,
    },
    readMoreText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 10,
    },
})

export default ArtistBio