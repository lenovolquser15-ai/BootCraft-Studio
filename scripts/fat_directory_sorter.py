#!/usr/bin/env python3
"""
BootCraft Studio — FAT32 Directory Table Sorter
Упорядочивает физический порядок записей в каталогах FAT32, чтобы старые музыкальные
центры, автомагнитолы и DVD-плееры воспроизводили треки в строгом порядке номеров (01, 02...).
"""

import os
import sys
import shutil

def sort_directory(path, recursive=True):
    if not os.path.isdir(path):
        print(f"[!] Путь не найден: {path}")
        return

    print(f"[*] Обработка каталога: {path}")

    # Получаем список файлов и папок
    items = [item for item in os.listdir(path) if not item.startswith('.')]
    if not items:
        return

    # Натуральная алфавитная сортировка
    items.sort(key=lambda s: s.lower())

    temp_staging = os.path.join(path, '__bootcraft_temp_sort__')
    os.makedirs(temp_staging, exist_ok=True)

    try:
        # Перемещаем во временную папку
        for item in items:
            src = os.path.join(path, item)
            dst = os.path.join(temp_staging, item)
            shutil.move(src, dst)

        # Перемещаем обратно строго по алфавиту/номеру
        for item in items:
            src = os.path.join(temp_staging, item)
            dst = os.path.join(path, item)
            shutil.move(src, dst)
    finally:
        if os.path.exists(temp_staging):
            os.rmdir(temp_staging)

    # Рекурсивная обработка подкаталогов
    if recursive:
        for item in items:
            sub = os.path.join(path, item)
            if os.path.isdir(sub):
                sort_directory(sub, recursive=True)

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else '.'
    print("=" * 60)
    print(" BootCraft Studio — Сортировщик записей таблицы FAT32")
    print("=" * 60)
    sort_directory(target)
    print("\n[+] Успешно! Файлы упорядочены в физической таблице каталога.")
