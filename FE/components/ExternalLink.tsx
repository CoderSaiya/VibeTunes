import { Link } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { type ComponentProps } from "react";
import { Platform } from "react-native";

// Khai báo kiểu đường dẫn ngoài
type ExternalPathString =
    | `http://${string}`
    | `https://${string}`
    | `mailto:${string}`
    | `tel:${string}`;

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
    href: ExternalPathString;
};

export function ExternalLink({ href, ...rest }: Props) {
    return (
        <Link
            target="_blank"
            {...rest}
            href={href}
            onPress={async (event) => {
                if (Platform.OS !== "web") {
                    // Ngăn chặn chuyển sang browser mặc định
                    event.preventDefault();
                    // Mở link bằng in-app browser
                    await openBrowserAsync(href);
                }
            }}
        />
    );
}